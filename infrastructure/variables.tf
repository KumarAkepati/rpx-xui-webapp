variable "product" {}

variable "location" {
  default = "UK South"
}
variable "env" {
  type = "string"
}

variable "shared_product_name" {
    default = "rpx"
}

variable "subscription" {
  type = "string"
}

variable "common_tags" {
  type = "map"
}

variable "enable_ase" {
    default = false
}

variable "application_type" {
  default     = "web"
  description = "Type of Application Insights (Web/Other)"
}
