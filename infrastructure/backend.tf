terraform {
  required_version = "0.11.14"
  backend "s3" {
    bucket = "tg-states"
    region = "eu-central-1"
    key = "dwh"
    role_arn = "arn:aws:iam::687874990873:role/tools-admin"
    dynamodb_table = "terraform-lock"
  }
}

data "terraform_remote_state" "shared_infrastructure" {
  backend = "s3"

  config {
    bucket         = "terraform-global-state"
    region         = "eu-central-1"
    key            = "cross-account/global/shared"
    role_arn       = "arn:aws:iam::687874990873:role/tools-admin"
    profile        = "tools-admin"
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  version = ">= 2.10"
  region  = "eu-central-1"

  assume_role {
    role_arn = "${data.terraform_remote_state.shared_infrastructure.prod_admin_role_arn}"
  }

  allowed_account_ids = [
    "${data.terraform_remote_state.shared_infrastructure.prod_account_id}",
  ]

  alias = "production.frankfurt"
}

provider "aws" {
  version = ">= 2.10"
  region  = "eu-central-1"

  assume_role {
    role_arn = "${data.terraform_remote_state.shared_infrastructure.tools_admin_role_arn}"
  }

  allowed_account_ids = [
    "${data.terraform_remote_state.shared_infrastructure.tools_account_id}",
  ]

  alias = "tools.frankfurt"
}