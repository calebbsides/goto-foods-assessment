resource "vercel_project" "app" {
  name      = "group-order"
  framework = "nextjs"

  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = var.production_branch
  }
}

locals {
  # Store the PEM key with escaped newlines. The app un-escapes \n at load
  # (see src/lib/config.ts). Passing raw newlines through Vercel env storage
  # corrupts the multi-line value, so we send single-line-with-\n instead.
  private_key_escaped = replace(local.sa_key.private_key, "\n", "\\n")

  # Vercel suffixes the domain when the base name is taken
  # (group-order -> group-order-theta). Set to the assigned production domain.
  production_url = "https://group-order-theta.vercel.app"

  public_env = {
    NEXT_PUBLIC_FIREBASE_API_KEY     = data.google_firebase_web_app_config.this.api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = data.google_firebase_web_app_config.this.auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID  = google_project.this.project_id
    APP_BASE_URL                     = local.production_url
  }

  server_env = {
    FIREBASE_PROJECT_ID   = google_project.this.project_id
    FIREBASE_CLIENT_EMAIL = google_service_account.app.email
    FIREBASE_PRIVATE_KEY  = local.private_key_escaped
    GCP_PROJECT_ID        = google_project.this.project_id
    GCP_CLIENT_EMAIL      = google_service_account.app.email
    GCP_PRIVATE_KEY       = local.private_key_escaped
  }
}

resource "vercel_project_environment_variable" "public" {
  for_each = local.public_env

  project_id = vercel_project.app.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview", "development"]
  sensitive  = false
}

resource "vercel_project_environment_variable" "server" {
  for_each = local.server_env

  project_id = vercel_project.app.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview"]
  sensitive  = true
}
