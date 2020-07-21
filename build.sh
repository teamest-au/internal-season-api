CLIENT_OUTPUT_DIR="./client";
SERVER_OUTPUT_DIR="./server";

npx grpc_tools_node_protoc\
  --plugin="protoc-gen-ts=node_modules/.bin/protoc-gen-ts" \
  --plugin="protoc-gen-grpc=node_modules/.bin/grpc_tools_node_protoc_plugin" \
  --proto_path=proto \
  --ts_out="service=grpc-node:${CLIENT_OUTPUT_DIR}" \
  --js_out="import_style=commonjs,binary:${CLIENT_OUTPUT_DIR}" \
  --grpc_out="grpc_js:${CLIENT_OUTPUT_DIR}"\
  proto/season.proto;

npx grpc_tools_node_protoc\
  --plugin="protoc-gen-ts=node_modules/.bin/protoc-gen-ts" \
  --plugin="protoc-gen-grpc=node_modules/.bin/grpc_tools_node_protoc_plugin" \
  --proto_path=proto \
  --ts_out="service=grpc-node:${SERVER_OUTPUT_DIR}" \
  --js_out="import_style=commonjs,binary:${SERVER_OUTPUT_DIR}" \
  --grpc_out="grpc_js:${SERVER_OUTPUT_DIR}"\
  proto/season.proto;

cd client;

rm -rf dist
mkdir dist

sed -i -- 's/import \* as grpc from "grpc";/import \* as grpc from "@grpc\/grpc-js";/g' *.d.ts

npm run build

cp *.d.ts dist
cp *.js dist

cd ../server

sed -i -- 's/import \* as grpc from "grpc";/import \* as grpc from "@grpc\/grpc-js";/g' *.d.ts

npm run build

cp *.d.ts dist
cp *.js dist