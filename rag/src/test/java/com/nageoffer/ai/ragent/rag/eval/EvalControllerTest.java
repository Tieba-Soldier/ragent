/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.nageoffer.ai.ragent.rag.eval;

import com.nageoffer.ai.ragent.knowledge.dao.mapper.KnowledgeChunkMapper;
import com.nageoffer.ai.ragent.knowledge.dao.mapper.KnowledgeDocumentMapper;
import com.nageoffer.ai.ragent.rag.core.intent.IntentResolver;
import com.nageoffer.ai.ragent.rag.core.retrieval.RetrievalEngine;
import com.nageoffer.ai.ragent.rag.core.rewrite.QueryRewriteService;
import com.nageoffer.ai.ragent.rag.core.rewrite.RewriteResult;
import com.nageoffer.ai.ragent.rag.dto.SubQuestionIntent;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class EvalControllerTest {

    @Test
    void systemOnlyIntentReturnsEvaluationResultWithoutRetrieval() {
        QueryRewriteService rewriteService = mock(QueryRewriteService.class);
        IntentResolver intentResolver = mock(IntentResolver.class);
        RetrievalEngine retrievalEngine = mock(RetrievalEngine.class);
        RewriteResult rewriteResult = new RewriteResult("你好", List.of("你好"));
        List<SubQuestionIntent> subIntents = List.of(new SubQuestionIntent("你好", List.of()));
        when(rewriteService.rewriteWithSplit("你好", List.of())).thenReturn(rewriteResult);
        when(intentResolver.resolve(rewriteResult)).thenReturn(subIntents);
        when(intentResolver.areAllSystemOnly(subIntents)).thenReturn(true);

        EvalController controller = new EvalController(
                rewriteService,
                intentResolver,
                retrievalEngine,
                mock(KnowledgeChunkMapper.class),
                mock(KnowledgeDocumentMapper.class)
        );

        controller.chat("你好");

        verifyNoInteractions(retrievalEngine);
    }
}
