# Event API load test

This dependency-free test sends read-only requests to the public event endpoint. It does not create RSVP or photo records.

Run against a local API:

```powershell
npm.cmd run test:load
```

Run against a remote deployment only when you are authorized to load test it:

```powershell
$env:LOAD_TEST_BASE_URL='https://your-api.example.com'
$env:ALLOW_REMOTE_LOAD_TEST='true'
$env:LOAD_TEST_STAGES='5x10,15x10,30x10'
npm.cmd run test:load
```

Each stage uses the `concurrency x duration-in-seconds` format. The command fails when more than 1% of requests return an error.
