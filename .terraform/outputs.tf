output "address" {
  value = "Public DNS Instance: ${aws_instance.web.public_dns}"
}

output "private_key" {
  value = "${tls_private_key.privkey.private_key_pem}"
  sensitive = true
}