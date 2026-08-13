package com.springboot.caretrace.api.lesion.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Orthanc PACS REST API를 프록시하는 서비스.
 * 이 앱에는 리액티브 컨트롤러 전례가 없어 일관성을 위해 동기 컨트롤러 안에서 .block()으로 사용한다.
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class LesionDicomProxyServiceImpl implements LesionDicomProxyService {

    private final WebClient orthancWebClient;

    @Override
    public JsonNode getStudies() {
        return orthancWebClient.get()
                .uri("/studies?expand")
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    @Override
    public JsonNode getSeries(String studyId) {
        return orthancWebClient.get()
                .uri("/studies/{studyId}/series?expand", studyId)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // 함정: InstanceNumber보다 신뢰도 높은 IndexInSeries로 정렬한다.
    @Override
    public JsonNode getOrderedInstances(String seriesId) {
        JsonNode seriesInfo = orthancWebClient.get()
                .uri("/series/{seriesId}", seriesId)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        List<JsonNode> instances = new ArrayList<>();
        if (seriesInfo != null && seriesInfo.has("Instances")) {
            for (JsonNode instanceIdNode : seriesInfo.get("Instances")) {
                String instanceId = instanceIdNode.asText();
                JsonNode instanceInfo = orthancWebClient.get()
                        .uri("/instances/{instanceId}", instanceId)
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .block();
                if (instanceInfo != null) {
                    instances.add(instanceInfo);
                }
            }
        }

        instances.sort(Comparator.comparingInt(
                node -> node.path("IndexInSeries").asInt(0)
        ));

        ArrayNode arrayNode = JsonNodeFactory.instance.arrayNode();
        instances.forEach(arrayNode::add);
        return arrayNode;
    }

    @Override
    public byte[] getPreview(String instanceId) {
        return orthancWebClient.get()
                .uri("/instances/{instanceId}/preview", instanceId)
                .accept(MediaType.valueOf("image/png"))
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public JsonNode getTags(String instanceId) {
        return orthancWebClient.get()
                .uri("/instances/{instanceId}/simplified-tags", instanceId)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    // 함정#2: study/series/sopInstanceUid는 저장해두지만 Orthanc는 내부 해시 ID로 조회하므로
    // UID -> Orthanc ID 변환이 별도로 필요하다.
    @Override
    public JsonNode resolve(String uid) {
        return orthancWebClient.post()
                .uri("/tools/lookup")
                .contentType(MediaType.TEXT_PLAIN)
                .bodyValue(uid)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }
}
