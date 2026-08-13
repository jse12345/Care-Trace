package com.springboot.caretrace.api.lesion.service;

import com.fasterxml.jackson.databind.JsonNode;

public interface LesionDicomProxyService {

    JsonNode getStudies();

    JsonNode getSeries(String studyId);

    JsonNode getOrderedInstances(String seriesId);

    byte[] getPreview(String instanceId);

    JsonNode getTags(String instanceId);

    JsonNode resolve(String uid);
}
