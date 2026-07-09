# Infrastructure

Terraform provisions everything needed to run this app in the cloud, on the free tiers of
GCP/Firebase and Vercel:

- A new GCP project with the required APIs enabled
- A Firebase project + web app (client config)
- A Firestore database, the deny-all security rules, and the collection-group index
- Identity Platform config (backs Google sign-in)
- A runtime service account (Admin SDK + Cloud Logging) with least-privilege IAM and a key
- A Vercel project connected to your GitHub repo, with every environment variable set

## Prerequisites

1. **Terraform** >= 1.9 and the **gcloud CLI**.
2. A GCP account with a **billing account** (the free tier still requires one on file).
3. A **GitHub repo** containing this code (Vercel deploys from it).
4. A **Vercel account** and an API token.

## One-time auth

```bash
gcloud auth application-default login
```

This is the credential Terraform uses for GCP. No key file needed.

## Configure

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: billing_account, support_email, github_repo
```

Set the Vercel token in your shell so it never lands on disk:

```bash
# PowerShell
$env:TF_VAR_vercel_api_token = "<your-vercel-token>"
# bash
export TF_VAR_vercel_api_token="<your-vercel-token>"
```

Get the values you need:

```bash
gcloud billing accounts list          # -> billing_account
# Vercel token: https://vercel.com/account/tokens
```

## Apply

```bash
terraform init
terraform plan
terraform apply
```

Apply takes a few minutes (project creation and API enablement are the slow parts).

## Two manual steps Terraform cannot do

Terraform provisions the Identity Platform config, but enabling the **Google** sign-in
provider and branding the OAuth consent screen are console-only. After `apply`:

1. Open the URL from the `enable_google_signin_url` output. Enable **Google**, set the
   support email, save.
2. In **Authentication > Settings > Authorized domains**, add `group-order.vercel.app`
   (and any custom domain) so sign-in is allowed from the deployed URL.

Then push to your production branch (or hit "Redeploy" in Vercel) to build with the
environment variables in place. The `next_steps` output restates this.

## Verify

Open the `vercel_production_url` output. You should be able to sign in with Google, start
an order, invite a guest, and check out. Logs appear in the GCP console under Logging and
Error Reporting for the project id in the `gcp_project_id` output.

## Teardown

```bash
terraform destroy
```

`deletion_policy` on the project and database is set to `DELETE`, so this removes
everything. The Vercel project is deleted too; the GitHub repo is left untouched.

## Notes

- Terraform **state contains secrets** (the service account key). It is gitignored here.
  For team use, move state to a remote backend (GCS bucket) with encryption.
- The service account key is injected into Vercel as `FIREBASE_PRIVATE_KEY` /
  `GCP_PRIVATE_KEY`. Rotate it by tainting `google_service_account_key.app`.
