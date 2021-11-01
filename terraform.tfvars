terragrunt = {
    terraform {
        source = "git::git@github.com:Advanon/advanon-infrastructure.git//terraform/modules/cicd/serverless?ref=tags/v0.1.19"
    }
}

project_name = "advanext-dwh-2"
