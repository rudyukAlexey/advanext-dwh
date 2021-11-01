locals {
  subnets = "${split(",", data.aws_ssm_parameter.prod-private-subnets.value)}"
}

resource "random_string" "redshift_password" {
  length = 12
  special = false
}

resource "aws_redshift_subnet_group" "prod-dwh-subnet-group" {
  name = "dwh-production"
  subnet_ids = [
    "${local.subnets[0]}",
    "${local.subnets[1]}",
    "${local.subnets[2]}",
  ]
}

resource "aws_redshift_cluster" "prod-dwh-cluster" {
  cluster_identifier = "dwh-prod-cluster"
  database_name = "dwh"
  master_username = "awsuser"
  master_password = "${random_string.redshift_password.result}"
  node_type = "dc1.large"
  cluster_type = "single-node"
  cluster_subnet_group_name = "${aws_redshift_subnet_group.prod-dwh-subnet-group.name}"
  number_of_nodes = 1
  vpc_security_group_ids = [
    "${aws_security_group.prod-lambda-to-redshift.id}",
    "${aws_security_group.prod-ssh-stitch-to-redshift.id}",
    "${aws_security_group.prod-stitch-to-redshift.id}",
    "${data.aws_ssm_parameter.prod-vpn-sg.value}"
  ]
  provider = "aws.production.frankfurt"
  tags = "${var.prod-tags}"
}

resource "aws_ssm_parameter" "prod-redshift-username" {
  name = "/prod/advanext-dwh/REDSHIFT_USERNAME"
  type = "SecureString"
  overwrite = true
  tags = "${var.prod-tags}"
  provider = "aws.production.frankfurt"
  value = "${aws_redshift_cluster.prod-dwh-cluster.master_username}"
}

resource "aws_ssm_parameter" "prod-redshift-password" {
  name = "/prod/advanext-dwh/REDSHIFT_PASSWORD"
  type = "SecureString"
  overwrite = true
  tags = "${var.prod-tags}"
  provider = "aws.production.frankfurt"
  value = "${aws_redshift_cluster.prod-dwh-cluster.master_password}"
}

resource "aws_ssm_parameter" "prod-redshift-host" {
  name = "/prod/advanext-dwh/REDSHIFT_HOST"
  type = "SecureString"
  overwrite = true
  tags = "${var.prod-tags}"
  provider = "aws.production.frankfurt"
  value = "${aws_redshift_cluster.prod-dwh-cluster.endpoint}"
}

resource "aws_ssm_parameter" "prod-redshift-database" {
  name = "/prod/advanext-dwh/REDSHIFT_DATABASE"
  type = "SecureString"
  overwrite = true
  tags = "${var.prod-tags}"
  provider = "aws.production.frankfurt"
  value = "${aws_redshift_cluster.prod-dwh-cluster.database_name}"
}

resource "aws_security_group" "prod-stitch-to-redshift" {
  name = "prod-dwh-stitch"
  vpc_id = "${data.aws_ssm_parameter.prod-vpc-id.value}"
  description = "Allows Stitch Data connects to Redshift"
  tags = "${var.prod-tags}"
  ingress {
    from_port = 22
    protocol = "tcp"
    to_port = 22
    cidr_blocks = [
      "3.126.102.29/32",
      "18.158.16.164/32",
      "18.158.251.55/32",
      "52.57.235.168/32"
    ]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [
      "0.0.0.0/0"]
    ipv6_cidr_blocks = [
      "::/0"]
  }
  provider = "aws.production.frankfurt"
}

resource "aws_security_group" "prod-lambda-to-redshift" {
  name = "prod-lambda-to-redshift"
  description = "Allows lambda access Redshift db"
  vpc_id = "${data.aws_ssm_parameter.prod-vpc-id.value}"
  tags = "${var.prod-tags}"
  ingress {
    from_port = 5439
    protocol = "tcp"
    to_port = 5439
    cidr_blocks = [
      "0.0.0.0/0"]
    ipv6_cidr_blocks = [
      "::/0"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [
      "0.0.0.0/0"]
    ipv6_cidr_blocks = [
      "::/0"]
  }
  provider = "aws.production.frankfurt"
}

resource "aws_security_group" "prod-ssh-stitch-to-redshift" {
  name = "prod-ssh-stitch-to-redshift"
  description = "Allows SSH EC2(with stitch) machine connects to Redshift Server"
  vpc_id = "${data.aws_ssm_parameter.prod-vpc-id.value}"
  tags = "${var.prod-tags}"
  ingress {
    from_port = 5439
    protocol = "tcp"
    to_port = 5439
    cidr_blocks = [
      "10.3.194.189/32"]
    ipv6_cidr_blocks = [
      "::/0"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [
      "0.0.0.0/0"]
    ipv6_cidr_blocks = [
      "::/0"]
  }
  provider = "aws.production.frankfurt"
}