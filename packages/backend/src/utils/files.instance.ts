import { S3Client } from "@aws-sdk/client-s3";

const awsConfig = {
  region: "eu-central-003",
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID || "",
    secretAccessKey: process.env.B2_APPLICATION_KEY || "",
  },
  signatureVersion: "v4",
};

const b2 = new S3Client(awsConfig);
// Sanity log: make sure these are the values you expect (mask most of it)
(async () => {
  const creds = await b2.config.credentials();
  console.log(
    "Using accessKeyId:",
    (creds as any).accessKeyId?.slice(0, 6) + "..."
  ); // should match your Application Key ID prefix
})();

export { b2 };
