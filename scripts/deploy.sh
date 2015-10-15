#!/bin/bash
readonly WILDFLY_URL="${WILDFLY_PROTOCOL}://${WILDFLY_USER}:${WILDFLY_PASSWORD}@${WILDFLY_HOST}:${WILDFLY_PORT}/management"

echo ${WILDFLY_URL}

echo "Undeploy old war"
curl -k -S -H "content-Type: application/json" -d "{\"operation\":\"undeploy\", \"address\":[{\"deployment\":\"${ARTIFACT_NAME}\"}]}" --digest ${WILDFLY_URL}
echo ""

echo "Remove old war"
curl -k -S -H "content-Type: application/json" -d "{\"operation\":\"remove\", \"address\":[{\"deployment\":\"${ARTIFACT_NAME}\"}]}" --digest ${WILDFLY_URL}
echo ""

echo "Upload new war"
bytes_value=`curl -k -F "file=@${ARTIFACT_PATH}/${ARTIFACT_NAME}" --digest ${WILDFLY_URL}/add-content | perl -pe 's/^.*"BYTES_VALUE"\s*:\s*"(.*)".*$/$1/'`
echo $bytes_value

json_string_start='{"content":[{"hash": {"BYTES_VALUE" : "'
json_string_end="\"}}], \"address\": [{\"deployment\":\"${ARTIFACT_NAME}\"}], \"operation\":\"add\", \"enabled\":\"true\"}"
json_string="$json_string_start$bytes_value$json_string_end"

echo "Deploy new war"
result=`curl -k -S -H "Content-Type: application/json" -d "$json_string" --digest ${WILDFLY_URL} | perl -pe 's/^.*"outcome"\s*:\s*"(.*)".*$/$1/'`
echo $result

if [ "$result" != "success" ]; then
  exit -1
fi