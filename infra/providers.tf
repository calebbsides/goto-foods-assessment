provider "google" {
  user_project_override = true
}

provider "google-beta" {
  user_project_override = true
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id != "" ? var.vercel_team_id : null
}

provider "random" {}

provider "time" {}
