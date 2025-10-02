package org.cortex.backend.agent.tools;

import java.util.List;
import java.util.Map;
import java.util.function.Function;

public abstract class AbstractTool {

    public abstract Function<Map<String,Object>, String> toolFunction();

    public Boolean previewRequired = Boolean.FALSE;

    public String createJSONList(List<String> jsonList) {
        StringBuilder data = new StringBuilder();
        jsonList.forEach(json -> data.append(json).append(",\n"));
        return """
                [
                <<data>>
                ]
                """.replace("<<data>>", data.toString());
    }

}
