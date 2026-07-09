variable "billing_account" {
  type        = string
  description = "GCP billing account id (format: XXXXXX-XXXXXX-XXXXXX). Find it with: gcloud billing accounts list"
}

variable "org_id" {
  type        = string
  description = "GCP organization id to create the project under. Leave empty for a standalone project."
  default     = ""
}

variable "project_name" {
  type        = string
  description = "Display name for the new GCP/Firebase project."
  default     = "Group Order"
}

variable "project_prefix" {
  type        = string
  description = "Prefix for the generated project id (a random suffix is appended for global uniqueness)."
  default     = "group-order"
}

variable "firestore_location" {
  type        = string
  description = "Firestore location. Use a regional location for the free tier, e.g. us-central1, nam5, eur3."
  default     = "nam5"
}

variable "support_email" {
  type        = string
  description = "Support email shown on the OAuth consent screen (must be an owner/editor of the project)."
}

variable "vercel_api_token" {
  type        = string
  description = "Vercel API token (https://vercel.com/account/tokens). Set via TF_VAR_vercel_api_token."
  sensitive   = true
}

variable "vercel_team_id" {
  type        = string
  description = "Vercel team id, if deploying under a team. Leave empty for a personal account."
  default     = ""
}

variable "github_repo" {
  type        = string
  description = "GitHub repository connected to Vercel, in owner/name form (e.g. calebbsides/group-order)."
}

variable "production_branch" {
  type        = string
  description = "Git branch that triggers production deploys."
  default     = "main"
}
