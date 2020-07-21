set -eou pipefail

rm -rf ./grpc-types
mkdir ./grpc-types

npx grpc_tools_node_protoc\
  --plugin="protoc-gen-ts=node_modules/.bin/protoc-gen-ts" \
  --plugin="protoc-gen-grpc=node_modules/.bin/grpc_tools_node_protoc_plugin" \
  --proto_path=proto \
  --ts_out="service=grpc-node:./grpc-types" \
  --js_out="import_style=commonjs,binary:./grpc-types" \
  --grpc_out="grpc_js:./grpc-types"\
  proto/season.proto;

sed -i -- 's/import \* as grpc from "grpc";/import \* as grpc from "@grpc\/grpc-js";/g' grpc-types/*.d.ts

npx tsc
