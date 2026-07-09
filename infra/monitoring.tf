locals {
  app_log_filter = "logName=\"projects/${google_project.this.project_id}/logs/group-order\""
}

# Distribution of client-reported LCP (ms), extracted from the web_vitals log entries.
resource "google_logging_metric" "lcp" {
  project = google_project.this.project_id
  name    = "web_vitals_lcp"
  filter  = "${local.app_log_filter} jsonPayload.message=\"web_vitals\" jsonPayload.metric=\"LCP\""

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "DISTRIBUTION"
    unit        = "ms"
    display_name = "Web Vitals LCP"
  }

  value_extractor = "EXTRACT(jsonPayload.value)"

  bucket_options {
    exponential_buckets {
      num_finite_buckets = 64
      growth_factor      = 1.4
      scale              = 1
    }
  }

  depends_on = [google_project_service.services]
}

# Count of application errors (anything logged at ERROR severity by our logger).
resource "google_logging_metric" "errors" {
  project = google_project.this.project_id
  name    = "app_errors"
  filter  = "${local.app_log_filter} severity=ERROR"

  metric_descriptor {
    metric_kind  = "DELTA"
    value_type   = "INT64"
    display_name = "Application errors"
  }

  depends_on = [google_project_service.services]
}

resource "google_monitoring_notification_channel" "email" {
  project      = google_project.this.project_id
  display_name = "Group Order alerts"
  type         = "email"

  labels = {
    email_address = var.support_email
  }

  depends_on = [google_project_service.services]
}

# Alert when p95 LCP over a 5-minute window exceeds 2.5s (the "good" threshold).
resource "google_monitoring_alert_policy" "lcp_degraded" {
  project      = google_project.this.project_id
  display_name = "LCP p95 above 2.5s"
  combiner     = "OR"
  severity     = "WARNING"

  conditions {
    display_name = "LCP p95 > 2500ms (5m)"

    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.lcp.name}\" resource.type=\"global\""
      comparison      = "COMPARISON_GT"
      threshold_value = 2500
      duration        = "300s"

      aggregations {
        alignment_period     = "300s"
        per_series_aligner   = "ALIGN_PERCENTILE_95"
        cross_series_reducer = "REDUCE_MEAN"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    content   = "Real-user Largest Contentful Paint p95 crossed 2.5s. Check the latest deploy, image sizes, and the catalog fetch on the order and home pages."
    mime_type = "text/markdown"
  }
}

# Alert when application error rate exceeds ~0.1/s (roughly 30 errors in 5 minutes).
resource "google_monitoring_alert_policy" "error_rate" {
  project      = google_project.this.project_id
  display_name = "Application error rate elevated"
  combiner     = "OR"
  severity     = "ERROR"

  conditions {
    display_name = "Errors > 0.1/s (5m)"

    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.errors.name}\" resource.type=\"global\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.1
      duration        = "300s"

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_RATE"
      }

      trigger {
        count = 1
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  documentation {
    content   = "Application error rate crossed 0.1 errors/second over 5 minutes. Open Error Reporting to see the grouped stack traces."
    mime_type = "text/markdown"
  }
}

resource "google_monitoring_dashboard" "app" {
  project = google_project.this.project_id

  dashboard_json = jsonencode({
    displayName = "Group Order overview"
    mosaicLayout = {
      columns = 12
      tiles = [
        {
          width = 6, height = 4, xPos = 0, yPos = 0
          widget = {
            title = "LCP p95 (ms)"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.lcp.name}\" resource.type=\"global\""
                    aggregation = {
                      alignmentPeriod  = "300s"
                      perSeriesAligner = "ALIGN_PERCENTILE_95"
                    }
                  }
                }
                plotType = "LINE"
              }]
              thresholds = [{ value = 2500, label = "good <= 2.5s" }]
              yAxis = { label = "ms", scale = "LINEAR" }
            }
          }
        },
        {
          width = 6, height = 4, xPos = 6, yPos = 0
          widget = {
            title = "Application error rate (per second)"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.errors.name}\" resource.type=\"global\""
                    aggregation = {
                      alignmentPeriod  = "300s"
                      perSeriesAligner = "ALIGN_RATE"
                    }
                  }
                }
                plotType = "LINE"
              }]
              yAxis = { label = "errors/s", scale = "LINEAR" }
            }
          }
        },
      ]
    }
  })

  depends_on = [google_project_service.services]
}
