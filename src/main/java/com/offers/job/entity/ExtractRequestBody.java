package com.offers.job.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ExtractRequestBody {

    public List<String> data;

    @JsonProperty("max_keywords")
    public int maxKeyWords;

    public ExtractRequestBody(List<String> data, int maxKeyWords) {
        this.data = data;
        this.maxKeyWords = maxKeyWords;
    }
}
