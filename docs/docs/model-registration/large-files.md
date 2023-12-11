---
layout: default
title: Uploading Large Files
parent: Model Registration
---

# Uploading Large Files
Some models may require uploading large files into the containerization environment. To do this, we provide access to Amazon Web Service's Simple Cloud Storage (AWS S3). Accessing the Dojo S3 is easy, but it does require an AWS access key and secret key. Please reach out to dojo@jataware.com to request access.

There are numerous ways to upload files to S3. We will describe below the two most common methods:

1. Using the AWS CLI
2. Using the Python `boto3` library

> **WARNING**: leaking your Dojo AWS credentials to the public may cause your access to Dojo to be revoked!


## Uploading files with the AWS CLI

First, you'll need to download and install the [AWS CLI](https://aws.amazon.com/cli/). Next, in a terminal, type `aws configure`. You should be prompted for the AWS access key and secret key provided to you by the Dojo team.

If you are already using the AWS CLI you should consider adding a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) called `dojo-modeling`. 

Now, to upload a file you can run:

```
aws s3 cp my_large_file.csv s3://dojo-modeling-data/
```

If you have created an AWS profile locally you may append ` --profile=dojo-modeling` to the above command. Once you've received confirmation that the file is uploaded, it will be available **to the public** at:
```
https://dojo-modeling-data.s3.amazonaws.com/my_large_file.csv
```
:::warning
All files uploaded to the `dojo-modeling-data` S3 bucket are public by default.
:::


## Uploading files with `boto3`

If you are a Python user, you may wish to upload large files using Python's `boto3` library. First install it with `pip3 install boto3`. Then, in a Python terminal run:


```
import boto3

s3_client = boto3.client(
    's3',
    aws_access_key_id='YOUR_ACCESS_KEY',
    aws_secret_access_key='YOUR_SECRET_KEY',
)

s3_client.upload_file('my_large_file.csv','dojo-modeling-data','my_large_file.csv')
```

You should now be able to download the file from `https://dojo-modeling-data.s3.amazonaws.com/my_large_file.csv`.


## Downloading your large file

You may download your large file from the containerization environment using `wget`:

```
wget https://dojo-modeling-data.s3.amazonaws.com/my_large_file.csv
```