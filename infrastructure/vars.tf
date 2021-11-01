variable "prod-tags" {
  type = "map"

  default = {
    PROJECT     = "nectar-prod"
    ENVIRONMENT = "prod"
  }
}

variable "region" {
  default = "eu-central-1"
}