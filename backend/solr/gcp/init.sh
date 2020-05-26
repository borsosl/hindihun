#!/bin/bash

cd /home/solr
mkdir hindihun
gsutil cp gs://hindihun.appspot.com/solr/hindihun.zip .

# important not to unzip/copy directly to /var/solr/data
# it's within a volume, and as such the owner cannot be set to solr
unzip hindihun.zip -d ./hindihun

solr-precreate hindihun ./hindihun
