resource "google_service_account" "app" {
  project      = google_project.this.project_id
  account_id   = "group-order-app"
  display_name = "Group Order runtime (Admin SDK + logging)"
  depends_on   = [time_sleep.wait_for_services]
}

resource "google_project_iam_member" "app_roles" {
  for_each = toset([
    "roles/datastore.user",
    "roles/firebaseauth.admin",
    "roles/logging.logWriter",
    "roles/cloudtrace.agent",
    "roles/errorreporting.writer",
  ])

  project = google_project.this.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_service_account_key" "app" {
  service_account_id = google_service_account.app.name
}

locals {
  sa_key = jsondecode(base64decode(google_service_account_key.app.private_key))
}
