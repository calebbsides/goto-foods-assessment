resource "random_id" "suffix" {
  byte_length = 3
}

locals {
  project_id = "${var.project_prefix}-${random_id.suffix.hex}"
}

resource "google_project" "this" {
  name            = var.project_name
  project_id      = local.project_id
  billing_account = var.billing_account
  org_id          = var.org_id != "" ? var.org_id : null
  deletion_policy = "DELETE"

  labels = {
    app = "group-order"
  }
}

resource "google_project_service" "services" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com",
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "identitytoolkit.googleapis.com",
    "logging.googleapis.com",
    "clouderrorreporting.googleapis.com",
    "cloudtrace.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
  ])

  project            = google_project.this.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "time_sleep" "wait_for_services" {
  depends_on      = [google_project_service.services]
  create_duration = "60s"
}
