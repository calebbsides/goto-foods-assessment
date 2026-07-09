output "gcp_project_id" {
  description = "The created GCP/Firebase project id."
  value       = google_project.this.project_id
}

output "firebase_auth_domain" {
  description = "Firebase auth domain used by the client SDK."
  value       = data.google_firebase_web_app_config.this.auth_domain
}

output "service_account_email" {
  description = "Runtime service account (Admin SDK + logging)."
  value       = google_service_account.app.email
}

output "vercel_project_id" {
  description = "Vercel project id."
  value       = vercel_project.app.id
}

output "vercel_production_url" {
  description = "Production URL Vercel assigns to the project."
  value       = local.production_url
}

output "enable_google_signin_url" {
  description = "Open this to enable the Google sign-in provider (one manual toggle)."
  value       = "https://console.firebase.google.com/project/${google_project.this.project_id}/authentication/providers"
}

output "firebase_console_url" {
  description = "Firebase console for this project."
  value       = "https://console.firebase.google.com/project/${google_project.this.project_id}/overview"
}

output "next_steps" {
  description = "Post-apply manual steps."
  value       = <<-EOT
    1. Enable Google sign-in:
       ${data.google_firebase_web_app_config.this.auth_domain != "" ? "open the Authentication providers page (see enable_google_signin_url), enable Google, set the support email, save." : ""}
    2. Authorize the Vercel domain for auth:
       Firebase console > Authentication > Settings > Authorized domains > add group-order-theta.vercel.app
    3. Push to the '${var.production_branch}' branch (or redeploy in Vercel) to trigger the first production build.
  EOT
}
