resource "google_firebase_project" "this" {
  provider   = google-beta
  project    = google_project.this.project_id
  depends_on = [time_sleep.wait_for_services]
}

resource "google_firebase_web_app" "this" {
  provider     = google-beta
  project      = google_project.this.project_id
  display_name = "Group Order Web"
  depends_on   = [google_firebase_project.this]
}

data "google_firebase_web_app_config" "this" {
  provider   = google-beta
  project    = google_project.this.project_id
  web_app_id = google_firebase_web_app.this.app_id
}

resource "google_firestore_database" "this" {
  provider        = google-beta
  project         = google_project.this.project_id
  name            = "(default)"
  location_id     = var.firestore_location
  type            = "FIRESTORE_NATIVE"
  deletion_policy = "DELETE"
  depends_on      = [google_firebase_project.this]
}

resource "google_firebaserules_ruleset" "firestore" {
  provider = google-beta
  project  = google_project.this.project_id
  source {
    files {
      name    = "firestore.rules"
      content = file("${path.module}/../firestore.rules")
    }
  }
  depends_on = [google_firestore_database.this]
}

resource "google_firebaserules_release" "firestore" {
  provider     = google-beta
  project      = google_project.this.project_id
  name         = "cloud.firestore/(default)"
  ruleset_name = google_firebaserules_ruleset.firestore.name
  depends_on   = [google_firestore_database.this]
}

resource "google_firestore_field" "invite_token" {
  provider   = google-beta
  project    = google_project.this.project_id
  database   = google_firestore_database.this.name
  collection = "participants"
  field      = "inviteTokenHash"

  index_config {
    indexes {
      order       = "ASCENDING"
      query_scope = "COLLECTION_GROUP"
    }
  }
}

resource "google_identity_platform_config" "this" {
  provider = google-beta
  project  = google_project.this.project_id

  authorized_domains = [
    "localhost",
    "${google_project.this.project_id}.firebaseapp.com",
    "${google_project.this.project_id}.web.app",
    replace(local.production_url, "https://", ""),
  ]

  sign_in {
    allow_duplicate_emails = false
  }

  depends_on = [time_sleep.wait_for_services]
}
