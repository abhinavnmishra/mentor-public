package org.cortex.backend;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ForwardController {
    @GetMapping("/{path:[^\\.]*}")
    public String forward() {
        // Forward to index.html for handling by React Router
        return "forward:/index.html";
    }
}