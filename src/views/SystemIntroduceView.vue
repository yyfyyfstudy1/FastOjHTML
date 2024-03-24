<template>
  <div id="introduceView">
    <a-typography :style="{ marginTop: '-40px' }">
      <a-typography-title> Fast OJ</a-typography-title>
      <a-typography-paragraph>
        Users can choose a topic, do it online, write code and submit the code; the system will judge the code submitted by the user and determine whether the result submitted by the user is correct based on the answer set by our question maker.
      </a-typography-paragraph>
      <a-typography-title :heading="2">1. Project Difficulties</a-typography-title>
      <a-typography-paragraph>
        The system used for online evaluation of programming question codes can compile the code, run the code, and determine whether the code operation result is correct based on the code submitted by the user and the question input and output use cases preset by the questioner.
        <a-typography-text mark>Question judging system</a-typography-text>
      </a-typography-paragraph>
      <a-typography-title :heading="2">2. Project background</a-typography-title>
      <a-typography-paragraph>
        OJ（Online
         The Judge system is an online programming evaluation system where users can select topics, write code and submit the code for evaluation. However, O.J.
         The core difficulty of the system lies in the design and implementation of the question judging system, which needs to be able to compile, execute and evaluate user code, and compare it with the answers set by the question maker.
         The goal is to develop an efficient and stable OJ
         The online question evaluation system supports multiple programming languages and can automatically compile, execute and evaluate user code. By providing high-quality online programming assessment services, we hope to promote the development of programming education and promote the growth of learners.
      </a-typography-paragraph>

      <a-typography-title :heading="2">3. Core highlights of the project</a-typography-title>
      <a-typography-paragraph>
        <ol>
          <li>Permission verification: who can mention the code and who cannot mention the code</li>
          <li>
            Code Sandbox (Security Sandbox)
            <ul>
              <li>User code hides poison: write a Trojan file and modify system permissions</li>
              <li>
                Sandbox: an isolated, safe environment where user code will not affect the operation of systems outside the sandbox
              </li>
              <li>
                Resource allocation: The system's memory is only 2G. Users are crazy about occupying resources to fill up your memory, and others cannot use it. Therefore, it is necessary to limit the resources occupied by user programs.
              </li>
              <li></li>
            </ul>
          </li>
          <li>
            Judgment rules
            <ul>
              <li>Comparison of question use cases and verification of results</li>
            </ul>
          </li>
          <li>
            Task scheduling
            <ul>
              <li>
                The server resources are limited. Users have to queue up and execute the judgment questions in order instead of rejecting them directly.
              </li>
            </ul>
          </li>
        </ol>
      </a-typography-paragraph>
    </a-typography>
  </div>
</template>
<style scoped>
#introduceView {
  margin: 0 auto;
  max-width: 1024px;
}
</style>
