data "aws_ssm_parameter" "prod-vpc-id" {
  name = "/prod/eu-central-1/infrastructure/vpc-id"

  provider = "aws.tools.frankfurt"
}

data "aws_ssm_parameter" "prod-private-subnets" {
  name = "/prod/eu-central-1/infrastructure/subnets/private"

  provider = "aws.tools.frankfurt"
}

data "aws_ssm_parameter" "prod-db-subnet-group" {
  name = "/prod/eu-central-1/infrastructure/db-subnet-group-name"

  provider = "aws.tools.frankfurt"
}

data "aws_ssm_parameter" "prod-vpn-sg" {
  name = "/prod/eu-central-1/infrastructure/VPN_SECURITY_GROUP"

  provider = "aws.tools.frankfurt"
}