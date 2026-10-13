window.NANOGPT_IDEA_GRAPH = {
  "version": 1,
  "task": "nanoGPT training optimization",
  "metric": {
    "name": "validation bits per byte",
    "key": "val_bpb",
    "direction": "minimize"
  },
  "graph": {
    "nodes": 70,
    "edges": 112
  },
  "nodes": [
    {
      "id": "NG-LIVE::L1-ec6a6e48a786",
      "title": "Establish a smaller-batch baseline",
      "plan": "Set TOTAL_BATCH_SIZE to 2^17 while keeping DEVICE_BATCH_SIZE at 64, giving one microbatch per optimizer step. Run the configuration for the fixed 1200-second budget and record validation bits per byte.",
      "rationale": "A smaller total batch permits more optimizer updates within the same wall-clock budget. This opening run establishes the operating point from which later changes can be compared.",
      "insight": "This run recorded val_bpb 0.984828. This is the first measured baseline in the displayed research run; without an included parent, it does not isolate the effect of batch size by itself.",
      "score": 0.984828,
      "x": 886.1,
      "y": 131.46,
      "experiment": "1"
    },
    {
      "id": "NG-LIVE::L1-a381d7802a29",
      "title": "Retune weight decay for the smaller batch",
      "plan": "Starting from EXP 1, reduce Muon WEIGHT_DECAY from 0.20 to 0.05 while leaving the batch configuration and other optimizer settings unchanged.",
      "rationale": "The smaller batch applies weight decay across more optimizer steps per processed token. Reducing the per-step coefficient tests whether the new update frequency otherwise over-regularizes the matrix parameters.",
      "insight": "This run recorded val_bpb 0.975101, lower than EXP 1 by 0.009727. Reducing weight decay to 0.05 improved the objective, so this setting becomes the stronger parent for the next branch of experiments.",
      "score": 0.975101,
      "x": 802.74,
      "y": 157.54,
      "experiment": "2"
    },
    {
      "id": "NG-LIVE::L1-8a45f3c98073",
      "title": "Evaluate EMA weights at the final checkpoint",
      "plan": "Maintain an exponential moving average of all trainable parameters with decay 0.999 during the EXP 2 configuration, then evaluate the averaged parameters at the end of the run.",
      "rationale": "Averaging can smooth noisy late-stage updates, but it also adds state-management and final-swap risks. This trial tests the complete EMA evaluation path before further tuning it.",
      "insight": "This run recorded val_bpb 1.078416, higher than EXP 2 by 0.103315. The EMA evaluation was substantially worse than its parent. The result rejects this implementation as used here, but does not distinguish an unsuitable decay from a buffer or swap error.",
      "score": 1.078416,
      "x": 788.75,
      "y": 229.86,
      "experiment": "3"
    },
    {
      "id": "NG-LIVE::L1-d286e3e89d82",
      "title": "Lower the embedding learning rate",
      "plan": "From EXP 2, lower EMBEDDING_LR from 0.60 to 0.30 while keeping the smaller batch, weight decay, and all non-embedding optimizer settings fixed.",
      "rationale": "Embedding parameters receive more Adam updates under the smaller batch. Halving their rate tests whether the additional update frequency causes embedding overshoot.",
      "insight": "This run recorded val_bpb 0.979500, higher than EXP 2 by 0.004399. The lower embedding rate regressed, so this comparison does not support the overshoot hypothesis and favors retaining 0.60.",
      "score": 0.9795,
      "x": 743.61,
      "y": 142.09,
      "experiment": "4"
    },
    {
      "id": "NG-LIVE::L1-f77ffc164884",
      "title": "Shorten the learning-rate cooldown",
      "plan": "From EXP 2, reduce WARMDOWN_RATIO from 0.50 to 0.30 so the learning rate remains at its peak for 70% of the run and anneals during the final 30%.",
      "rationale": "The smaller-batch configuration has many more optimizer steps. A shorter cooldown tests whether spending more of the fixed budget at peak learning rate improves fit.",
      "insight": "This run recorded val_bpb 0.978801, higher than EXP 2 by 0.003700. The shorter cooldown regressed, so keeping the peak rate longer did not help this configuration.",
      "score": 0.978801,
      "x": 671.21,
      "y": 123.48,
      "experiment": "5"
    },
    {
      "id": "NG-LIVE::L1-2351229d373d",
      "title": "Lengthen the learning-rate cooldown",
      "plan": "From EXP 2, increase WARMDOWN_RATIO from 0.50 to 0.70 so annealing spans the final 70% of the run.",
      "rationale": "EXP 5 showed that a shorter cooldown was worse than the 0.50 parent. Testing the opposite direction checks whether a more gradual anneal improves the same operating point.",
      "insight": "This run recorded val_bpb 0.976014, higher than EXP 2 by 0.000913. The longer cooldown also regressed. Within the tested 0.30, 0.50, and 0.70 settings, the parent value of 0.50 remains best.",
      "score": 0.976014,
      "x": 741.11,
      "y": 97.25,
      "experiment": "6"
    },
    {
      "id": "NG-LIVE::L1-829071f2775a",
      "title": "Raise the embedding learning rate",
      "plan": "From EXP 2, raise EMBEDDING_LR from 0.60 to 0.90 while leaving the remaining configuration unchanged.",
      "rationale": "Because EXP 4 regressed when the embedding rate was halved, the opposite direction tests whether embeddings benefit from faster adaptation rather than protection from overshoot.",
      "insight": "This run recorded val_bpb 0.977920, higher than EXP 2 by 0.002819. The higher embedding rate also regressed, placing 0.60 between two worse tested values in this configuration.",
      "score": 0.97792,
      "x": 684.47,
      "y": 185.8,
      "experiment": "7"
    },
    {
      "id": "NG-LIVE::L1-47b99942b7f1",
      "title": "Lower the Muon matrix learning rate",
      "plan": "From EXP 2, reduce MATRIX_LR from 0.04 to 0.02 while keeping the smaller batch and WEIGHT_DECAY at 0.05.",
      "rationale": "Matrix parameters receive more optimizer updates under the smaller batch. Lowering the per-step matrix rate tests whether those updates are otherwise too aggressive.",
      "insight": "This run recorded val_bpb 0.976126, higher than EXP 2 by 0.001025. The lower matrix rate regressed, so the comparison favors retaining 0.04.",
      "score": 0.976126,
      "x": 847,
      "y": 86.61,
      "experiment": "8"
    },
    {
      "id": "NG-LIVE::L1-7a9a80fd0f60",
      "title": "Halve Muon weight decay again",
      "plan": "From EXP 2, reduce WEIGHT_DECAY from 0.05 to 0.025 without changing any other setting.",
      "rationale": "EXP 2 improved after reducing weight decay from 0.20 to 0.05. A second reduction tests whether the smaller-batch regime remains over-regularized.",
      "insight": "This run recorded val_bpb 0.970501, lower than EXP 2 by 0.004600. The second reduction improved the objective and establishes 0.025 as the stronger tested setting.",
      "score": 0.970501,
      "x": 850.85,
      "y": 231.84,
      "experiment": "9"
    },
    {
      "id": "NG-LIVE::L1-459d5b775e4d",
      "title": "Continue the weight-decay bracket",
      "plan": "From EXP 9, reduce WEIGHT_DECAY from 0.025 to 0.0125 while keeping the rest of the configuration fixed.",
      "rationale": "Two earlier reductions improved the recorded objective. Halving the coefficient again locates whether that trend continues below 0.025 or has crossed its useful range.",
      "insight": "This run recorded val_bpb 0.971282, higher than EXP 9 by 0.000781. The additional reduction regressed, so the tested bracket favors 0.025 over 0.0125.",
      "score": 0.971282,
      "x": 952,
      "y": 223.09,
      "experiment": "10"
    },
    {
      "id": "NG-LIVE::L1-7784f299a66d",
      "title": "Extend the Muon variance window",
      "plan": "From EXP 9, raise the Muon second-moment coefficient beta2 from 0.95 to 0.99 while preserving weight decay, learning rates, and batch settings.",
      "rationale": "More optimizer steps shorten the amount of data represented by a fixed-length step-based variance window. Raising beta2 tests whether a longer estimate stabilizes Muon step normalization.",
      "insight": "This run recorded val_bpb 0.970385, lower than EXP 9 by 0.000116. The longer variance window produced a small improvement. Because the difference is modest, it is retained as a candidate rather than treated as a confirmed mechanism.",
      "score": 0.970385,
      "x": 768.08,
      "y": 309.31,
      "experiment": "11"
    },
    {
      "id": "NG-LIVE::L1-ea98fce1143f",
      "title": "Scale the model to nine layers",
      "plan": "From EXP 11, increase model depth from 8 to 9 layers and use the corresponding width produced by the configuration builder, while retaining the settled optimizer settings.",
      "rationale": "The current run leaves compute and memory headroom. A larger model may improve prediction quality per token enough to offset the lower number of tokens processed in the fixed time budget.",
      "insight": "This run recorded val_bpb 0.960992, lower than EXP 11 by 0.009393. The nine-layer model improved clearly over its parent, so it becomes the new architecture baseline.",
      "score": 0.960992,
      "x": 800.08,
      "y": 392.57,
      "experiment": "12"
    },
    {
      "id": "NG-LIVE::L1-905d0a7180e4",
      "title": "Test depth ten with a smaller device batch",
      "plan": "From EXP 12, increase depth to 10 layers and reduce DEVICE_BATCH_SIZE from 64 to 32 to control memory use, keeping TOTAL_BATCH_SIZE at 2^17 through gradient accumulation.",
      "rationale": "EXP 12 benefited from added capacity, but another depth increase may exceed the memory budget at the existing device batch. This combined trial tests a feasible depth-ten configuration.",
      "insight": "This run recorded val_bpb 1.015229, higher than EXP 12 by 0.054237. The combined depth and device-batch change regressed substantially. Because two factors changed together, the result does not isolate the cause.",
      "score": 1.015229,
      "x": 879.05,
      "y": 432.68,
      "experiment": "13"
    },
    {
      "id": "NG-LIVE::L1-555043b23dc8",
      "title": "Isolate the depth-ten change",
      "plan": "Starting from EXP 12, increase depth from 9 to 10 while keeping DEVICE_BATCH_SIZE at 64 and leaving the other settings unchanged.",
      "rationale": "EXP 13 combined extra depth with a smaller device batch. Holding device batch fixed separates the architectural change from that execution change.",
      "insight": "This run recorded val_bpb 0.964196, higher than EXP 12 by 0.003204. Depth ten still regressed with device batch held fixed, so the tested depth-nine model remains better.",
      "score": 0.964196,
      "x": 820.78,
      "y": 478.36,
      "experiment": "14"
    },
    {
      "id": "NG-LIVE::L1-2632c9db8166",
      "title": "Lengthen the Muon momentum ramp",
      "plan": "From EXP 12, extend the 0.85-to-0.95 Muon momentum ramp from 300 to 1500 optimizer steps.",
      "rationale": "The smaller batch reaches the momentum endpoint early in the run. A longer ramp tests whether slower early dynamics improve optimization of the larger model.",
      "insight": "This run recorded val_bpb 0.962038, higher than EXP 12 by 0.001046. The longer ramp regressed, so delaying the momentum endpoint to 1500 steps did not help.",
      "score": 0.962038,
      "x": 761.67,
      "y": 437.39,
      "experiment": "15"
    },
    {
      "id": "NG-LIVE::L1-3845d3fadd29",
      "title": "Widen the nine-layer model",
      "plan": "From EXP 12, increase ASPECT_RATIO from 64 to 88 while keeping depth at 9 and retaining the same training settings.",
      "rationale": "Depth nine improved over depth eight, but the best allocation of additional capacity is unknown. Widening tests the alternative scaling direction under the same time budget.",
      "insight": "This run recorded val_bpb 0.963859, higher than EXP 12 by 0.002867. The wider model regressed, so the parent width remains better for the fixed-time objective.",
      "score": 0.963859,
      "x": 902.63,
      "y": 387.43,
      "experiment": "16"
    },
    {
      "id": "NG-LIVE::L1-a9287d391b51",
      "title": "Shorten the Muon momentum ramp",
      "plan": "From EXP 12, shorten the 0.85-to-0.95 Muon momentum ramp from 300 to 150 steps.",
      "rationale": "EXP 15 showed that a much longer ramp was worse. Testing the opposite direction brackets whether reaching high momentum earlier is beneficial.",
      "insight": "This run recorded val_bpb 0.961546, higher than EXP 12 by 0.000554. The shorter ramp also regressed, leaving 300 steps as the best of the three tested ramp lengths at this stage.",
      "score": 0.961546,
      "x": 681.84,
      "y": 348.78,
      "experiment": "17"
    },
    {
      "id": "NG-LIVE::L1-0cf6b81ccad3",
      "title": "Enable reduce-overhead compilation",
      "plan": "From EXP 12, compile the model with mode=\"reduce-overhead\" and static shapes, leaving model and optimizer settings unchanged.",
      "rationale": "The fixed-time objective can benefit from execution improvements that permit more training work without changing the mathematical configuration. This trial tests the low-overhead compilation mode.",
      "insight": "This run recorded val_bpb 0.960425, lower than EXP 12 by 0.000567. The compiled configuration improved modestly, supporting further work on the execution path while retaining the same model settings.",
      "score": 0.960425,
      "x": 622.7,
      "y": 369.5,
      "experiment": "18"
    },
    {
      "id": "NG-LIVE::L1-f05e7ebb93bc",
      "title": "Extend the Adam variance window",
      "plan": "From EXP 18, change Adam beta2 from 0.95 to 0.99 for the embedding, output-head, and scalar parameter groups.",
      "rationale": "EXP 11 showed a small gain from a longer Muon variance window. This trial tests whether the same step-frequency argument transfers to the Adam-managed groups.",
      "insight": "This run recorded val_bpb 0.960496, higher than EXP 18 by 0.000071. The change produced a very small regression, so the Muon result does not transfer directly to Adam in this comparison.",
      "score": 0.960496,
      "x": 740.97,
      "y": 360.89,
      "experiment": "19"
    },
    {
      "id": "NG-LIVE::L1-cad2e12887ec",
      "title": "Retry EMA with fp32 buffers",
      "plan": "From EXP 18, maintain the 0.999 EMA state in fp32, cast it back to each parameter dtype only for final evaluation, and keep all other settings unchanged.",
      "rationale": "EXP 3 may have lost small EMA updates in lower-precision buffers. Repeating the test with fp32 state removes that specific numerical concern.",
      "insight": "This run recorded val_bpb 0.970715, higher than EXP 18 by 0.010290. The fp32 EMA still regressed materially, so correcting buffer precision was not enough to make final-weight averaging beneficial here.",
      "score": 0.970715,
      "x": 708.94,
      "y": 298.9,
      "experiment": "20"
    },
    {
      "id": "NG-LIVE::L1-357c2a966c2e",
      "title": "Use short windows in every patterned layer",
      "plan": "From EXP 18, change WINDOW_PATTERN from SSSL to SSSS while retaining the forced full-context final layer.",
      "rationale": "Replacing two intermediate long-window layers with short windows may reduce attention cost while preserving one global readout at the output.",
      "insight": "This run recorded val_bpb 0.960774, higher than EXP 18 by 0.000349. The all-short pattern regressed slightly, indicating that the removed intermediate long-window layers contributed more than the hoped-for efficiency gain.",
      "score": 0.960774,
      "x": 612.67,
      "y": 469.7,
      "experiment": "21"
    },
    {
      "id": "NG-LIVE::L1-ee10420f7ea6",
      "title": "Restore the effective embedding learning rate",
      "plan": "From EXP 18, raise EMBEDDING_LR from 0.60 to 0.67 for the depth-nine width, leaving all non-embedding settings fixed.",
      "rationale": "Width-dependent scaling lowered the effective embedding rate when the model grew. The new constant restores approximately the same effective rate used by the earlier, smaller model.",
      "insight": "This run recorded val_bpb 0.959622, lower than EXP 18 by 0.000803. Restoring the effective embedding rate improved the objective, so 0.67 becomes the new embedding setting.",
      "score": 0.959622,
      "x": 536.98,
      "y": 320.73,
      "experiment": "22"
    },
    {
      "id": "NG-LIVE::L1-ac55d908b2e0",
      "title": "Restore the effective output-head learning rate",
      "plan": "From EXP 22, raise UNEMBEDDING_LR from 0.00400 to 0.00447 while retaining the restored embedding rate and all other settings.",
      "rationale": "The output head uses the same width-dependent learning-rate scale. This test checks whether the transfer that helped embeddings also applies to the output projection.",
      "insight": "This run recorded val_bpb 0.961165, higher than EXP 22 by 0.001543. The output-head adjustment regressed, so effective-rate transfer is not adopted automatically across parameter groups.",
      "score": 0.961165,
      "x": 474.08,
      "y": 252.86,
      "experiment": "23"
    },
    {
      "id": "NG-LIVE::L1-24b1856b130d",
      "title": "Probe a higher embedding learning rate",
      "plan": "From EXP 22, raise EMBEDDING_LR from 0.67 to 0.72 and keep all other settings unchanged.",
      "rationale": "EXP 22 improved at 0.67. Testing a nearby higher value brackets whether the depth-nine optimum lies above the transferred rate.",
      "insight": "This run recorded val_bpb 0.960190, higher than EXP 22 by 0.000568. The higher value regressed, so 0.67 remains the better tested embedding rate.",
      "score": 0.96019,
      "x": 563.5,
      "y": 230.35,
      "experiment": "24"
    },
    {
      "id": "NG-LIVE::L1-32826de032df",
      "title": "Require full-graph compilation",
      "plan": "From EXP 22, add fullgraph=True to the reduce-overhead compilation configuration while preserving model and optimizer settings.",
      "rationale": "Forcing a single compiled graph may remove residual graph breaks and runtime overhead. It also verifies that the complete forward path can be captured.",
      "insight": "This run recorded val_bpb 0.959492, lower than EXP 22 by 0.000130. Full-graph compilation produced a small improvement, supporting its use in the next execution baseline.",
      "score": 0.959492,
      "x": 539.85,
      "y": 410.4,
      "experiment": "25"
    },
    {
      "id": "NG-LIVE::L1-60b63da3a425",
      "title": "Clip the global gradient norm",
      "plan": "From EXP 25, apply global gradient-norm clipping at 1.0 immediately before each optimizer step.",
      "rationale": "The current path has no global cap. Clipping tests whether occasional large gradients harm training while leaving ordinary updates unchanged.",
      "insight": "This run recorded val_bpb 0.960109, higher than EXP 25 by 0.000617. Clipping regressed, so a global norm cap of 1.0 is not retained for this configuration.",
      "score": 0.960109,
      "x": 553.51,
      "y": 507.55,
      "experiment": "26"
    },
    {
      "id": "NG-LIVE::L1-25d38d61180b",
      "title": "Lower the scalar-group learning rate",
      "plan": "From EXP 25, reduce the Adam learning rate for scalar parameters from 0.50 to 0.25 while leaving every other parameter group unchanged.",
      "rationale": "Scalar routing parameters receive more updates under the smaller batch. Lowering their rate tests whether their per-token adaptation is too aggressive.",
      "insight": "This run recorded val_bpb 0.960406, higher than EXP 25 by 0.000914. The lower scalar rate regressed, so the parent value of 0.50 remains preferred.",
      "score": 0.960406,
      "x": 420.24,
      "y": 391.73,
      "experiment": "27"
    },
    {
      "id": "NG-LIVE::L1-470c59e74fb5",
      "title": "Enable max-autotune compilation",
      "plan": "From EXP 25, switch compilation mode from reduce-overhead to max-autotune while retaining fullgraph=True and the same training configuration.",
      "rationale": "Kernel autotuning may find faster implementations for the fixed model shapes, allowing more work within the training budget without changing model semantics.",
      "insight": "This run recorded val_bpb 0.959472, lower than EXP 25 by 0.000020. Max-autotune produced only a very small improvement. It is retained provisionally, with the gain too small to establish a robust advantage without repeats.",
      "score": 0.959472,
      "x": 518.9,
      "y": 365.56,
      "experiment": "28"
    },
    {
      "id": "NG-LIVE::L1-4293df4a9f99",
      "title": "Raise the logit softcap",
      "plan": "From EXP 28, increase the logit softcap from 15 to 30 while keeping the model, optimizer, and compile settings fixed.",
      "rationale": "A higher cap reduces saturation of large logits and tests whether the existing transform limits late-stage fitting.",
      "insight": "This run recorded val_bpb 0.962968, higher than EXP 28 by 0.003496. The higher softcap regressed clearly, so the comparison favors retaining 15.",
      "score": 0.962968,
      "x": 533.19,
      "y": 275.9,
      "experiment": "29"
    },
    {
      "id": "NG-LIVE::L1-7e1e54630805",
      "title": "Raise the Muon momentum endpoint",
      "plan": "From EXP 28, raise the endpoint of the 300-step Muon momentum ramp from 0.95 to 0.9875 while keeping its start at 0.85.",
      "rationale": "A higher endpoint lengthens the effective first-moment window per processed token. This tests whether smoother directions help in the smaller-batch regime.",
      "insight": "This run recorded val_bpb 0.966318, higher than EXP 28 by 0.006846. The higher endpoint regressed substantially, so matching a longer theoretical window did not improve this run.",
      "score": 0.966318,
      "x": 622.66,
      "y": 267.29,
      "experiment": "30"
    },
    {
      "id": "NG-LIVE::L1-4f46bfb52417",
      "title": "Raise the Adam epsilon",
      "plan": "From EXP 28, increase Adam epsilon from 1e-10 to 1e-8 for all Adam-managed parameter groups.",
      "rationale": "A larger epsilon places a higher floor under the variance denominator and may limit oversized normalized updates for low-variance parameters.",
      "insight": "This run recorded val_bpb 0.959872, higher than EXP 28 by 0.000400. The larger epsilon regressed, so the existing 1e-10 setting remains better in this comparison.",
      "score": 0.959872,
      "x": 531.66,
      "y": 455.21,
      "experiment": "31"
    },
    {
      "id": "NG-LIVE::L1-453eccbb0a35",
      "title": "Shorten local attention windows to 512",
      "plan": "From EXP 28, reduce short-layer attention windows from 1024 to 512 tokens while retaining both intermediate long-window layers and the full-context final layer.",
      "rationale": "EXP 21 showed that removing intermediate long-window layers was harmful. Shortening only the local layers may recover efficiency without removing the global mixing path.",
      "insight": "This run recorded val_bpb 0.957778, lower than EXP 28 by 0.001694. The 512-token local window improved the objective, establishing window length as a promising axis.",
      "score": 0.957778,
      "x": 494.34,
      "y": 500.02,
      "experiment": "32"
    },
    {
      "id": "NG-LIVE::L1-d6369619065a",
      "title": "Shorten local attention windows to 256",
      "plan": "From EXP 32, reduce the short-layer attention window from 512 to 256 tokens and keep all long-window layers unchanged.",
      "rationale": "The 512-token result improved. Halving the local span again tests whether additional efficiency outweighs the loss of local context.",
      "insight": "This run recorded val_bpb 0.957416, lower than EXP 32 by 0.000362. The 256-token window improved further, so the bracket continues downward.",
      "score": 0.957416,
      "x": 408.03,
      "y": 538,
      "experiment": "33"
    },
    {
      "id": "NG-LIVE::L1-2048b318bbae",
      "title": "Shorten local attention windows to 128",
      "plan": "From EXP 33, reduce the short-layer attention window from 256 to 128 tokens while retaining the same long-window structure.",
      "rationale": "Two preceding reductions improved the objective. This trial continues the bracket to find where the context loss begins to outweigh the fixed-time benefit.",
      "insight": "This run recorded val_bpb 0.956267, lower than EXP 33 by 0.001149. The 128-token window improved again, supporting one more reduction.",
      "score": 0.956267,
      "x": 325.14,
      "y": 500.81,
      "experiment": "34"
    },
    {
      "id": "NG-LIVE::L1-c43c8ba34e2a",
      "title": "Shorten local attention windows to 64",
      "plan": "From EXP 34, reduce the short-layer attention window from 128 to 64 tokens and leave the 1024/2048-token global path unchanged.",
      "rationale": "The local-window sequence has improved through 128 tokens. Testing 64 locates whether the useful local span can be reduced further.",
      "insight": "This run recorded val_bpb 0.954796, lower than EXP 34 by 0.001471. The 64-token window produced another clear improvement and becomes the new local-window baseline.",
      "score": 0.954796,
      "x": 292.33,
      "y": 402.8,
      "experiment": "35"
    },
    {
      "id": "NG-LIVE::L1-d1bdb4c5d342",
      "title": "Shorten local attention windows to 32",
      "plan": "From EXP 35, reduce the short-layer attention window from 64 to 32 tokens while retaining the same long-window layers.",
      "rationale": "Four successive reductions improved the objective. Halving once more tests whether 64 tokens has reached the lower useful boundary.",
      "insight": "This run recorded val_bpb 0.956320, higher than EXP 35 by 0.001524. The 32-token window regressed, placing the best tested local span at 64 tokens.",
      "score": 0.95632,
      "x": 223.25,
      "y": 473.94,
      "experiment": "36"
    },
    {
      "id": "NG-LIVE::L1-0e323358a165",
      "title": "Decouple the value-embedding learning rate",
      "plan": "From EXP 35, keep the token-embedding rate at 0.67 and assign value embeddings a separate learning-rate constant of 0.90.",
      "rationale": "The earlier joint embedding-rate change could not identify which embedding group produced the gain. Moving only the value-embedding group tests that contribution.",
      "insight": "This run recorded val_bpb 0.954994, higher than EXP 35 by 0.000198. The decoupled higher value-embedding rate regressed slightly, so the shared 0.67 setting remains better.",
      "score": 0.954994,
      "x": 424.97,
      "y": 322.63,
      "experiment": "37"
    },
    {
      "id": "NG-LIVE::L1-2ba54986d6e3",
      "title": "Shorten the final attention window",
      "plan": "From EXP 35, reduce the forced final-layer attention window from 2048 to 1024 tokens while leaving local and intermediate windows unchanged.",
      "rationale": "Short local windows improved earlier trials. This experiment tests whether the same locality preference extends to the final readout layer.",
      "insight": "This run recorded val_bpb 0.955222, higher than EXP 35 by 0.000426. The shorter final window regressed, so the final layer retains full 2048-token context.",
      "score": 0.955222,
      "x": 229.28,
      "y": 384.19,
      "experiment": "38"
    },
    {
      "id": "NG-LIVE::L1-75aa03e2e41a",
      "title": "Shorten intermediate long windows to 1024",
      "plan": "From EXP 35, reduce only the two intermediate long-window layers from 2048 to 1024 tokens and keep the final layer at 2048.",
      "rationale": "EXP 38 showed that the final layer benefits from full context. Intermediate layers may need less reach, so this trial separates their window length from the final readout.",
      "insight": "This run recorded val_bpb 0.954506, lower than EXP 35 by 0.000290. The 1024-token intermediate windows improved the objective while the final layer remained global.",
      "score": 0.954506,
      "x": 171.45,
      "y": 339.05,
      "experiment": "39"
    },
    {
      "id": "NG-LIVE::L1-4b03a6669e38",
      "title": "Shorten intermediate long windows to 512",
      "plan": "From EXP 39, reduce the intermediate long-window layers from 1024 to 512 tokens while leaving the final 2048-token window unchanged.",
      "rationale": "The first reduction improved the objective. A second reduction tests whether 1024 is still more context than the intermediate layers require.",
      "insight": "This run recorded val_bpb 0.955071, higher than EXP 39 by 0.000565. The 512-token intermediate windows regressed, so 1024 remains the best tested value.",
      "score": 0.955071,
      "x": 139.85,
      "y": 408.73,
      "experiment": "40"
    },
    {
      "id": "NG-LIVE::L1-b4c54b6c69b8",
      "title": "Widen the value-embedding gate input",
      "plan": "From EXP 39, increase value-embedding gate input width from 32 to 64 channels without changing the value-embedding content or learning rate.",
      "rationale": "A wider gate sees more of the residual state and may make better-conditioned injection decisions, but it may also introduce irrelevant inputs.",
      "insight": "This run recorded val_bpb 0.954990, higher than EXP 39 by 0.000484. The wider gate regressed, so the additional input channels did not improve this configuration.",
      "score": 0.95499,
      "x": 314.85,
      "y": 285.9,
      "experiment": "41"
    },
    {
      "id": "NG-LIVE::L1-d6581f875d9c",
      "title": "Move long-window layers earlier",
      "plan": "From EXP 39, move the two 1024-token intermediate windows earlier in the stack while keeping their count, all window sizes, and the final 2048-token layer fixed.",
      "rationale": "Earlier global mixing could propagate document-level information through more subsequent local layers. Holding the number of long layers fixed isolates their placement.",
      "insight": "This run recorded val_bpb 0.954896, higher than EXP 39 by 0.000390. The earlier placement regressed, so the parent placement remains better.",
      "score": 0.954896,
      "x": 67.53,
      "y": 314.34,
      "experiment": "42"
    },
    {
      "id": "NG-LIVE::L1-b213c0f2bc2f",
      "title": "Sharpen attention within each window",
      "plan": "From EXP 39, multiply the default attention softmax scale by 1.25 while retaining all window sizes and other settings.",
      "rationale": "Narrow local windows reduced irrelevant context. A sharper softmax tests whether concentrating weights within those windows provides an additional benefit.",
      "insight": "This run recorded val_bpb 0.954838, higher than EXP 39 by 0.000332. The sharper attention scale regressed, showing that shorter windows do not imply that a higher softmax scale is also helpful.",
      "score": 0.954838,
      "x": 48,
      "y": 359.18,
      "experiment": "43"
    },
    {
      "id": "NG-LIVE::L1-c07caaa8a581",
      "title": "Lower the rotary-embedding base",
      "plan": "From EXP 39, reduce the rotary-embedding base from 10000 to 4000 while retaining the 64/1024/2048 attention-window structure.",
      "rationale": "A lower base increases phase separation across longer offsets. This tests whether the remaining long-window layers need stronger positional discrimination.",
      "insight": "This run recorded val_bpb 0.956368, higher than EXP 39 by 0.001862. The lower rotary base regressed, so stronger phase separation did not improve this configuration.",
      "score": 0.956368,
      "x": 78.44,
      "y": 404.06,
      "experiment": "44"
    },
    {
      "id": "NG-LIVE::L1-22c6be90d64f",
      "title": "Strengthen the input-skip initialization",
      "plan": "From EXP 39, raise the initial x0 residual coefficient from 0.10 to 0.50 while keeping the main residual coefficient and all attention settings fixed.",
      "rationale": "The input-skip path preserves token information through the stack. Strengthening it may complement the local-window design by maintaining a clearer identity signal.",
      "insight": "This run recorded val_bpb 0.954490, lower than EXP 39 by 0.000016. The change produced a very small improvement. It is carried forward as a candidate, but the difference is too small to establish the proposed mechanism.",
      "score": 0.95449,
      "x": 298.13,
      "y": 330.73,
      "experiment": "45"
    },
    {
      "id": "NG-LIVE::L1-eda79c527273",
      "title": "Reduce the main residual initialization",
      "plan": "From EXP 45, lower the initial main residual coefficient from 1.0 to 0.8 while retaining x0 initialization at 0.5.",
      "rationale": "After strengthening the input-skip path, reducing the main path tests whether shifting the initial balance further toward x0 is beneficial.",
      "insight": "This run recorded val_bpb 0.956481, higher than EXP 45 by 0.001991. The lower main residual coefficient regressed, so strengthening x0 does not justify weakening the main residual path.",
      "score": 0.956481,
      "x": 126.64,
      "y": 270.04,
      "experiment": "46"
    },
    {
      "id": "NG-LIVE::L1-d4ff110f67db",
      "title": "Halve value-embedding initialization scale",
      "plan": "From EXP 45, multiply the value-embedding initialization range by 0.5 while keeping its gate, learning rate, and all residual coefficients unchanged.",
      "rationale": "With a stronger x0 path, a quieter initial value-embedding contribution may reduce competition between residual sources during early training.",
      "insight": "This run recorded val_bpb 0.954449, lower than EXP 45 by 0.000041. Halving the value-embedding scale produced a very small improvement and is retained for further bracketing.",
      "score": 0.954449,
      "x": 311.76,
      "y": 193.97,
      "experiment": "47"
    },
    {
      "id": "NG-LIVE::L1-24677c0aee45",
      "title": "Quarter value-embedding initialization scale",
      "plan": "From EXP 47, reduce value-embedding initialization from 0.50× to 0.25× of the original range while keeping other settings fixed.",
      "rationale": "EXP 47 showed a small gain from a quieter initialization. Reducing it again tests whether that direction continues or begins to under-initialize the value path.",
      "insight": "This run recorded val_bpb 0.954533, higher than EXP 47 by 0.000084. The 0.25× scale regressed slightly, so the tested bracket favors 0.50×.",
      "score": 0.954533,
      "x": 262.4,
      "y": 125.91,
      "experiment": "48"
    },
    {
      "id": "NG-LIVE::L1-0f06215ecd97",
      "title": "Increase the input-skip initialization",
      "plan": "From EXP 47, raise x0 initialization from 0.50 to 0.75 while retaining the main residual coefficient at 1.0 and value-embedding scale at 0.50×.",
      "rationale": "The earlier move from 0.10 to 0.50 gave a very small gain. Testing 0.75 brackets whether a stronger input-skip path continues to help.",
      "insight": "This run recorded val_bpb 0.955213, higher than EXP 47 by 0.000764. The 0.75 setting regressed, so 0.50 remains the better tested x0 initialization.",
      "score": 0.955213,
      "x": 194.57,
      "y": 228.81,
      "experiment": "49"
    },
    {
      "id": "NG-LIVE::L1-8da329f79b06",
      "title": "Keep a nonzero final learning rate",
      "plan": "From EXP 47, set FINAL_LR_FRAC to 0.10 so the annealing schedule ends at 10% of peak learning rate rather than zero.",
      "rationale": "The final part of a zero-ending schedule uses very small updates. A nonzero floor tests whether keeping the tail active improves the fixed-time result.",
      "insight": "This run recorded val_bpb 0.957799, higher than EXP 47 by 0.003350. The nonzero floor regressed clearly, so the schedule continues to anneal to zero.",
      "score": 0.957799,
      "x": 511.61,
      "y": 145.89,
      "experiment": "50"
    },
    {
      "id": "NG-LIVE::L1-32db2f5ca7db",
      "title": "Double the Muon matrix learning rate",
      "plan": "From EXP 47, raise MATRIX_LR from 0.04 to 0.08 while keeping the smaller batch and all later improvements unchanged.",
      "rationale": "The smaller batch provides more optimizer updates. This trial tests whether the Muon-trained matrices benefit from larger per-step movement at the current operating point.",
      "insight": "This run recorded val_bpb 0.957851, higher than EXP 47 by 0.003402. The doubled matrix rate regressed, confirming that more frequent updates do not justify a larger per-step matrix rate here.",
      "score": 0.957851,
      "x": 121.71,
      "y": 200.64,
      "experiment": "51"
    },
    {
      "id": "NG-LIVE::L1-21bd39d9893a",
      "title": "Reduce token-embedding initialization scale",
      "plan": "From EXP 47, reduce token-embedding initialization standard deviation from 1.0 to 0.1 while leaving output-head and value-embedding initialization unchanged.",
      "rationale": "Token embeddings feed both the residual stream and strengthened x0 path. A smaller starting scale tests whether early activations are unnecessarily large.",
      "insight": "This run recorded val_bpb 0.955103, higher than EXP 47 by 0.000654. The smaller token-embedding scale regressed, so the original initialization is retained.",
      "score": 0.955103,
      "x": 374.02,
      "y": 255.04,
      "experiment": "52"
    },
    {
      "id": "NG-LIVE::L1-4e08572ff386",
      "title": "Add a third intermediate long-window layer",
      "plan": "From EXP 47, add one additional 1024-token attention layer near the existing intermediate long-window block while retaining 64-token local layers and the 2048-token final layer.",
      "rationale": "The current design benefits from some intermediate global mixing. Adding another long-window layer tests whether more mid-stack context outweighs its computation cost.",
      "insight": "This run recorded val_bpb 0.955597, higher than EXP 47 by 0.001148. The extra long-window layer regressed, so the parent number of intermediate global layers remains better.",
      "score": 0.955597,
      "x": 185.78,
      "y": 273.94,
      "experiment": "53"
    },
    {
      "id": "NG-LIVE::L1-6015289b716a",
      "title": "Initialize the value gate below neutral",
      "plan": "From EXP 47, initialize each value-embedding gate with weights sampled from [-1, 0] instead of zeros, leaving content scale and all other settings unchanged.",
      "rationale": "Reducing value-embedding content scale helped slightly. Starting its gate below neutral tests a separate way to suppress early value injection.",
      "insight": "This run recorded val_bpb 0.956232, higher than EXP 47 by 0.001783. The negative gate initialization regressed, so the quieter content result does not transfer to gate initialization.",
      "score": 0.956232,
      "x": 203.29,
      "y": 113.73,
      "experiment": "54"
    },
    {
      "id": "NG-LIVE::L1-9c13ab64f625",
      "title": "Add a short learning-rate warmup",
      "plan": "From EXP 47, add a 2% linear learning-rate warmup while keeping the cooldown and all optimizer constants fixed.",
      "rationale": "The smaller-batch regime begins with frequent updates from random initialization. A short warmup tests whether gentler early steps improve stability without consuming much of the budget.",
      "insight": "This run recorded val_bpb 0.956440, higher than EXP 47 by 0.001991. The warmup regressed, so the immediate-start schedule remains better in this comparison.",
      "score": 0.95644,
      "x": 144.16,
      "y": 155.81,
      "experiment": "55"
    },
    {
      "id": "NG-LIVE::L1-58acd55497c8",
      "title": "Extend the momentum ramp to 600 steps",
      "plan": "From EXP 47, lengthen the Muon momentum ramp from 300 to 600 steps while retaining its 0.85 start and 0.95 endpoint.",
      "rationale": "The earlier 150- and 1500-step trials bracketed both sides of 300. Testing 600 explores a moderate extension that may smooth early optimization without delaying high momentum too far.",
      "insight": "This run recorded val_bpb 0.954374, lower than EXP 47 by 0.000075. The 600-step ramp produced a very small improvement and becomes the parent for a tighter local bracket.",
      "score": 0.954374,
      "x": 442.63,
      "y": 153.13,
      "experiment": "56"
    },
    {
      "id": "NG-LIVE::L1-21b4cc67fce9",
      "title": "Extend the momentum ramp to 900 steps",
      "plan": "From EXP 56, lengthen the Muon momentum ramp from 600 to 900 steps while keeping its endpoints unchanged.",
      "rationale": "EXP 56 improved slightly at 600 steps. A 900-step trial tests whether a gentler transition continues that gain.",
      "insight": "This run recorded val_bpb 0.954490, higher than EXP 56 by 0.000116. The 900-step ramp regressed, so the local bracket favors 600 steps.",
      "score": 0.95449,
      "x": 503.54,
      "y": 74.54,
      "experiment": "57"
    },
    {
      "id": "NG-LIVE::L1-1fade7b54eee",
      "title": "Lower the momentum start",
      "plan": "From EXP 56, lower the start of the 600-step Muon momentum ramp from 0.85 to 0.70 while retaining the 0.95 endpoint.",
      "rationale": "The 600-step duration improved slightly. Lower starting momentum tests whether additional early responsiveness complements that schedule.",
      "insight": "This run recorded val_bpb 0.954587, higher than EXP 56 by 0.000213. The lower start regressed, so the comparison favors starting at 0.85.",
      "score": 0.954587,
      "x": 443.13,
      "y": 42,
      "experiment": "58"
    },
    {
      "id": "NG-LIVE::L1-00bbab10098b",
      "title": "Raise output-head initialization scale",
      "plan": "From EXP 56, increase output-head initialization standard deviation from 0.001 to 0.01 while keeping its learning rate and the rest of the model unchanged.",
      "rationale": "The output head begins at a much smaller scale than token embeddings. A larger initialization tests whether it learns useful logit directions earlier under its small learning rate.",
      "insight": "This run recorded val_bpb 0.957158, higher than EXP 56 by 0.002784. The larger output-head initialization regressed substantially, so the smaller 0.001 scale is retained.",
      "score": 0.957158,
      "x": 430.02,
      "y": 208.05,
      "experiment": "59"
    },
    {
      "id": "NG-LIVE::L1-1899a8e08cce",
      "title": "Raise value-embedding initialization to 0.75×",
      "plan": "From EXP 56, raise value-embedding initialization from 0.50× to 0.75× of the original range while keeping all other settings fixed.",
      "rationale": "Earlier trials placed 0.50× above both 1.00× and 0.25×. Testing 0.75× probes the remaining upper half of that bracket.",
      "insight": "This run recorded val_bpb 0.954451, higher than EXP 56 by 0.000077. The 0.75× setting produced a very small regression, so 0.50× remains the best tested scale.",
      "score": 0.954451,
      "x": 321.56,
      "y": 149.15,
      "experiment": "60"
    },
    {
      "id": "NG-LIVE::L1-a6ca4816d5ba",
      "title": "Lower the logit softcap",
      "plan": "From EXP 56, reduce the logit softcap from 15 to 12 while keeping the remaining configuration unchanged.",
      "rationale": "A previous increase to 30 regressed. Testing the lower side checks whether slightly stronger saturation improves the current model.",
      "insight": "This run recorded val_bpb 0.954636, higher than EXP 56 by 0.000262. The lower softcap also regressed, so 15 remains the best tested value across both directions.",
      "score": 0.954636,
      "x": 502.97,
      "y": 190.74,
      "experiment": "61"
    },
    {
      "id": "NG-LIVE::L1-c7423b9ead02",
      "title": "Replace ReLU-squared with GELU",
      "plan": "From EXP 56, replace the MLP ReLU-squared activation with GELU and leave architecture, widths, and optimizer settings unchanged.",
      "rationale": "GELU provides smooth nonzero gradients around the origin, whereas ReLU-squared is sparse and grows quadratically on positive inputs. The trial compares these activation dynamics directly.",
      "insight": "This run recorded val_bpb 0.970407, higher than EXP 56 by 0.016033. GELU regressed substantially, so the model retains ReLU-squared.",
      "score": 0.970407,
      "x": 563.65,
      "y": 63.85,
      "experiment": "62"
    },
    {
      "id": "NG-LIVE::L1-512ef780b683",
      "title": "Increase the document-packing buffer",
      "plan": "From EXP 56, increase the dataloader packing buffer from 1000 to 4000 documents while keeping the training configuration fixed.",
      "rationale": "A larger candidate pool may reduce truncation during best-fit sequence packing, but it can also increase CPU refill cost. The fixed-time metric captures the net tradeoff.",
      "insight": "This run recorded val_bpb 0.959713, higher than EXP 56 by 0.005339. The larger buffer regressed clearly. Without packing and throughput logs, the score shows only that the net configuration was worse, not which cost dominated.",
      "score": 0.959713,
      "x": 321.59,
      "y": 101.71,
      "experiment": "63"
    },
    {
      "id": "NG-LIVE::L1-ded7143f47df",
      "title": "Split the FA3 attention kernel",
      "plan": "From EXP 56, set FA3 num_splits from 1 to 2 while preserving attention windows and all mathematical model settings.",
      "rationale": "Short attention windows may underutilize the device under the default kernel split. A second split tests whether greater parallelism improves the fixed-time result.",
      "insight": "This run recorded val_bpb 0.955822, higher than EXP 56 by 0.001448. The two-split kernel regressed, so a valid kernel option did not translate into a better result for this workload.",
      "score": 0.955822,
      "x": 382.1,
      "y": 71.47,
      "experiment": "64"
    },
    {
      "id": "NG-LIVE::L1-a2b0ddb8b0f6",
      "title": "Raise the RMSNorm epsilon",
      "plan": "From EXP 56, increase epsilon for every RMSNorm operation from 1e-6 to 1e-3 without changing other model settings.",
      "rationale": "A larger epsilon can reduce sensitivity to small-vector numerical noise, but it may also damp useful scale variation. This experiment determines the direction empirically.",
      "insight": "This run recorded val_bpb 0.955410, higher than EXP 56 by 0.001036. The larger epsilon regressed, so the existing normalization floor remains better.",
      "score": 0.95541,
      "x": 601.52,
      "y": 108.8,
      "experiment": "65"
    },
    {
      "id": "NG-LIVE::L1-17e9e233f749",
      "title": "Narrow the value-gate input to 16 channels",
      "plan": "From EXP 56, reduce value-embedding gate input width from 32 to 16 channels while keeping value content, initialization, and learning rate unchanged.",
      "rationale": "The earlier 64-channel gate was worse than 32. Testing 16 checks whether a smaller input focuses the gate on the most useful subset of residual features.",
      "insight": "This run recorded val_bpb 0.954125, lower than EXP 56 by 0.000249. The 16-channel gate improved the objective, motivating a lower-width bracket.",
      "score": 0.954125,
      "x": 370.86,
      "y": 210.19,
      "experiment": "66"
    },
    {
      "id": "NG-LIVE::L1-6ee56b14365a",
      "title": "Narrow the value-gate input to 8 channels",
      "plan": "From EXP 66, reduce value-embedding gate input width from 16 to 8 channels and leave all other settings unchanged.",
      "rationale": "The 16-channel result improved. Halving again tests whether the gate can use an even more compact signal without losing necessary information.",
      "insight": "This run recorded val_bpb 0.954097, lower than EXP 66 by 0.000028. The 8-channel gate produced a very small improvement and becomes the best recorded gate width, though the margin needs repeat evaluation.",
      "score": 0.954097,
      "x": 253.73,
      "y": 238.81,
      "experiment": "67"
    },
    {
      "id": "NG-LIVE::L1-80cf3cf4f036",
      "title": "Narrow the value-gate input to 4 channels",
      "plan": "From EXP 67, reduce value-embedding gate input width from 8 to 4 channels while keeping the rest of the configuration fixed.",
      "rationale": "Two successive narrowing steps improved the objective. Testing 4 channels locates whether 8 is the lower useful boundary.",
      "insight": "This run recorded val_bpb 0.954399, higher than EXP 67 by 0.000302. The 4-channel gate regressed, placing the best tested width at 8 channels.",
      "score": 0.954399,
      "x": 62.56,
      "y": 234.51,
      "experiment": "68"
    },
    {
      "id": "NG-LIVE::L1-7ee34418cd81",
      "title": "Remove final-layer value injection",
      "plan": "From EXP 67, disable value-embedding injection only in the final transformer layer while retaining the other value-embedding layers and all attention windows.",
      "rationale": "The best gate-width trials reduced how much information controls value injection. Removing the final injection site tests whether the global readout is cleaner without that residual contribution.",
      "insight": "This run recorded val_bpb 0.961162, higher than EXP 67 by 0.007065. Removing final-layer value injection regressed substantially, so the final layer retains the value path.",
      "score": 0.961162,
      "x": 357.81,
      "y": 359.17,
      "experiment": "69"
    },
    {
      "id": "NG-LIVE::L1-58e30cfc502a",
      "title": "Reduce the document-packing buffer",
      "plan": "From EXP 67, reduce the dataloader packing buffer from 1000 to 500 documents while keeping training settings unchanged.",
      "rationale": "The larger 4000-document buffer was worse. Testing the opposite direction checks whether lower refill cost outweighs any loss in packing quality.",
      "insight": "This run recorded val_bpb 0.955561, higher than EXP 67 by 0.001464. The smaller buffer also regressed, so 1000 remains the best tested buffer size.",
      "score": 0.955561,
      "x": 223.43,
      "y": 170.75,
      "experiment": "70"
    }
  ],
  "edges": [
    {
      "id": "NG-LIVE::L1E-a153aa855123",
      "source": "NG-LIVE::L1-21bd39d9893a",
      "target": "NG-LIVE::L1-00bbab10098b",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-0f0cc3dad8b9",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-00bbab10098b",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-6a024498f843",
      "source": "NG-LIVE::L1-ac55d908b2e0",
      "target": "NG-LIVE::L1-00bbab10098b",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-05d291d95e42",
      "source": "NG-LIVE::L1-ea98fce1143f",
      "target": "NG-LIVE::L1-0cf6b81ccad3",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-c97ea2077777",
      "source": "NG-LIVE::L1-24b1856b130d",
      "target": "NG-LIVE::L1-0e323358a165",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-96f9765f62f7",
      "source": "NG-LIVE::L1-c43c8ba34e2a",
      "target": "NG-LIVE::L1-0e323358a165",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-6f1f35fd1b8b",
      "source": "NG-LIVE::L1-ee10420f7ea6",
      "target": "NG-LIVE::L1-0e323358a165",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-613090d596a8",
      "source": "NG-LIVE::L1-22c6be90d64f",
      "target": "NG-LIVE::L1-0f06215ecd97",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-40f249f879b4",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-0f06215ecd97",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-988f06b2642f",
      "source": "NG-LIVE::L1-eda79c527273",
      "target": "NG-LIVE::L1-0f06215ecd97",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-0941cbc99afa",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-17e9e233f749",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-d846654ead30",
      "source": "NG-LIVE::L1-b4c54b6c69b8",
      "target": "NG-LIVE::L1-17e9e233f749",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-2c33bbf2a9b1",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-17e9e233f749",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-95b2c0f4c67e",
      "source": "NG-LIVE::L1-24677c0aee45",
      "target": "NG-LIVE::L1-1899a8e08cce",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-6b53a73ab768",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-1899a8e08cce",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-25e90a8dfe46",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-1899a8e08cce",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-c00371b6735f",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-1fade7b54eee",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-511cde6b65f2",
      "source": "NG-LIVE::L1-d6369619065a",
      "target": "NG-LIVE::L1-2048b318bbae",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-3a1ad56f0184",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-21b4cc67fce9",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-90b2b304cb1c",
      "source": "NG-LIVE::L1-22c6be90d64f",
      "target": "NG-LIVE::L1-21bd39d9893a",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-8c0ab4775f37",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-21bd39d9893a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-cdfea36dcb48",
      "source": "NG-LIVE::L1-25d38d61180b",
      "target": "NG-LIVE::L1-22c6be90d64f",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-c1bc93f6a6f6",
      "source": "NG-LIVE::L1-75aa03e2e41a",
      "target": "NG-LIVE::L1-22c6be90d64f",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-54c83aabb020",
      "source": "NG-LIVE::L1-a381d7802a29",
      "target": "NG-LIVE::L1-2351229d373d",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-664117b5ce32",
      "source": "NG-LIVE::L1-f77ffc164884",
      "target": "NG-LIVE::L1-2351229d373d",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-5cab7ce4eb4c",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-24677c0aee45",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-7875be2e0db5",
      "source": "NG-LIVE::L1-829071f2775a",
      "target": "NG-LIVE::L1-24b1856b130d",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-4ba931805d11",
      "source": "NG-LIVE::L1-ee10420f7ea6",
      "target": "NG-LIVE::L1-24b1856b130d",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-2126e35e1845",
      "source": "NG-LIVE::L1-32826de032df",
      "target": "NG-LIVE::L1-25d38d61180b",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-513ed5b424ed",
      "source": "NG-LIVE::L1-ea98fce1143f",
      "target": "NG-LIVE::L1-2632c9db8166",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-086e07ddab69",
      "source": "NG-LIVE::L1-c43c8ba34e2a",
      "target": "NG-LIVE::L1-2ba54986d6e3",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-3b1587874a25",
      "source": "NG-LIVE::L1-0cf6b81ccad3",
      "target": "NG-LIVE::L1-32826de032df",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-0f45146ebd00",
      "source": "NG-LIVE::L1-ee10420f7ea6",
      "target": "NG-LIVE::L1-32826de032df",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-e42ec94aad24",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-32db2f5ca7db",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-9cd814600ee5",
      "source": "NG-LIVE::L1-0cf6b81ccad3",
      "target": "NG-LIVE::L1-357c2a966c2e",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-7efcff4c36ef",
      "source": "NG-LIVE::L1-ea98fce1143f",
      "target": "NG-LIVE::L1-3845d3fadd29",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-88771f6517f8",
      "source": "NG-LIVE::L1-470c59e74fb5",
      "target": "NG-LIVE::L1-4293df4a9f99",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-676e46bcf123",
      "source": "NG-LIVE::L1-ee10420f7ea6",
      "target": "NG-LIVE::L1-4293df4a9f99",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-be587397b196",
      "source": "NG-LIVE::L1-357c2a966c2e",
      "target": "NG-LIVE::L1-453eccbb0a35",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-a7ecf94ff982",
      "source": "NG-LIVE::L1-470c59e74fb5",
      "target": "NG-LIVE::L1-453eccbb0a35",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-ed8ee377d8c9",
      "source": "NG-LIVE::L1-7a9a80fd0f60",
      "target": "NG-LIVE::L1-459d5b775e4d",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-854ce7b475b2",
      "source": "NG-LIVE::L1-0cf6b81ccad3",
      "target": "NG-LIVE::L1-470c59e74fb5",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-f44eb7f36d15",
      "source": "NG-LIVE::L1-32826de032df",
      "target": "NG-LIVE::L1-470c59e74fb5",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-eb7b1423e3ba",
      "source": "NG-LIVE::L1-a381d7802a29",
      "target": "NG-LIVE::L1-47b99942b7f1",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-ac81641bde2b",
      "source": "NG-LIVE::L1-ec6a6e48a786",
      "target": "NG-LIVE::L1-47b99942b7f1",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-8e0cc88f0701",
      "source": "NG-LIVE::L1-2ba54986d6e3",
      "target": "NG-LIVE::L1-4b03a6669e38",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-9d1fa532b82b",
      "source": "NG-LIVE::L1-75aa03e2e41a",
      "target": "NG-LIVE::L1-4b03a6669e38",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-7270198b9628",
      "source": "NG-LIVE::L1-75aa03e2e41a",
      "target": "NG-LIVE::L1-4e08572ff386",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-7e466871f980",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-4e08572ff386",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-0cb6a2462c76",
      "source": "NG-LIVE::L1-d6581f875d9c",
      "target": "NG-LIVE::L1-4e08572ff386",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-73299a5f57ec",
      "source": "NG-LIVE::L1-470c59e74fb5",
      "target": "NG-LIVE::L1-4f46bfb52417",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-fb29753d38f1",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-512ef780b683",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-b0cddbe1ca78",
      "source": "NG-LIVE::L1-905d0a7180e4",
      "target": "NG-LIVE::L1-555043b23dc8",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-cc15d652aef3",
      "source": "NG-LIVE::L1-ea98fce1143f",
      "target": "NG-LIVE::L1-555043b23dc8",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-f6217ad4baae",
      "source": "NG-LIVE::L1-7e1e54630805",
      "target": "NG-LIVE::L1-58acd55497c8",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-71639ee93fe0",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-58acd55497c8",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-d9d63129aced",
      "source": "NG-LIVE::L1-512ef780b683",
      "target": "NG-LIVE::L1-58e30cfc502a",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-8922bfcc53f2",
      "source": "NG-LIVE::L1-6ee56b14365a",
      "target": "NG-LIVE::L1-58e30cfc502a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-24437b494976",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-6015289b716a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-19193588f4a3",
      "source": "NG-LIVE::L1-32826de032df",
      "target": "NG-LIVE::L1-60b63da3a425",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-bd8b445252a2",
      "source": "NG-LIVE::L1-17e9e233f749",
      "target": "NG-LIVE::L1-6ee56b14365a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-593d2fd96f18",
      "source": "NG-LIVE::L1-b4c54b6c69b8",
      "target": "NG-LIVE::L1-6ee56b14365a",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-711048a628b4",
      "source": "NG-LIVE::L1-2ba54986d6e3",
      "target": "NG-LIVE::L1-75aa03e2e41a",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-65db071de4b1",
      "source": "NG-LIVE::L1-c43c8ba34e2a",
      "target": "NG-LIVE::L1-75aa03e2e41a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-5697221822e6",
      "source": "NG-LIVE::L1-7a9a80fd0f60",
      "target": "NG-LIVE::L1-7784f299a66d",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-e804e761333b",
      "source": "NG-LIVE::L1-a381d7802a29",
      "target": "NG-LIVE::L1-7a9a80fd0f60",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-90a155194b10",
      "source": "NG-LIVE::L1-470c59e74fb5",
      "target": "NG-LIVE::L1-7e1e54630805",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-d61cd03ec90a",
      "source": "NG-LIVE::L1-7784f299a66d",
      "target": "NG-LIVE::L1-7e1e54630805",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-add8dee2747a",
      "source": "NG-LIVE::L1-a9287d391b51",
      "target": "NG-LIVE::L1-7e1e54630805",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-dc79c4402363",
      "source": "NG-LIVE::L1-22c6be90d64f",
      "target": "NG-LIVE::L1-7ee34418cd81",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-5f407da1f6e9",
      "source": "NG-LIVE::L1-2ba54986d6e3",
      "target": "NG-LIVE::L1-7ee34418cd81",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-70b4ab387787",
      "source": "NG-LIVE::L1-470c59e74fb5",
      "target": "NG-LIVE::L1-7ee34418cd81",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-b39682dc7164",
      "source": "NG-LIVE::L1-6ee56b14365a",
      "target": "NG-LIVE::L1-7ee34418cd81",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-5f03f7ae4020",
      "source": "NG-LIVE::L1-6ee56b14365a",
      "target": "NG-LIVE::L1-80cf3cf4f036",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-a9375d469c68",
      "source": "NG-LIVE::L1-a381d7802a29",
      "target": "NG-LIVE::L1-829071f2775a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-849fe09cbc89",
      "source": "NG-LIVE::L1-d286e3e89d82",
      "target": "NG-LIVE::L1-829071f2775a",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-861624a878af",
      "source": "NG-LIVE::L1-a381d7802a29",
      "target": "NG-LIVE::L1-8a45f3c98073",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-bf60c43932d6",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-8da329f79b06",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-6a46acbeb1c1",
      "source": "NG-LIVE::L1-f77ffc164884",
      "target": "NG-LIVE::L1-8da329f79b06",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-8cbb0f22f3b9",
      "source": "NG-LIVE::L1-ea98fce1143f",
      "target": "NG-LIVE::L1-905d0a7180e4",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-c71407668a26",
      "source": "NG-LIVE::L1-d4ff110f67db",
      "target": "NG-LIVE::L1-9c13ab64f625",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-ae155bada3df",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-a2b0ddb8b0f6",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-a4ba6cb951e6",
      "source": "NG-LIVE::L1-c7423b9ead02",
      "target": "NG-LIVE::L1-a2b0ddb8b0f6",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-e5394c1ebf4b",
      "source": "NG-LIVE::L1-ec6a6e48a786",
      "target": "NG-LIVE::L1-a381d7802a29",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-2c6f3ca1e0ab",
      "source": "NG-LIVE::L1-4293df4a9f99",
      "target": "NG-LIVE::L1-a6ca4816d5ba",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-fdb86fe3038a",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-a6ca4816d5ba",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-53888790388d",
      "source": "NG-LIVE::L1-2632c9db8166",
      "target": "NG-LIVE::L1-a9287d391b51",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-b4d45836af3a",
      "source": "NG-LIVE::L1-ea98fce1143f",
      "target": "NG-LIVE::L1-a9287d391b51",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-064bfd28cf26",
      "source": "NG-LIVE::L1-ee10420f7ea6",
      "target": "NG-LIVE::L1-ac55d908b2e0",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-258f6467d54e",
      "source": "NG-LIVE::L1-75aa03e2e41a",
      "target": "NG-LIVE::L1-b213c0f2bc2f",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-c1eb94678ec9",
      "source": "NG-LIVE::L1-0e323358a165",
      "target": "NG-LIVE::L1-b4c54b6c69b8",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-2238f877fcee",
      "source": "NG-LIVE::L1-75aa03e2e41a",
      "target": "NG-LIVE::L1-b4c54b6c69b8",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-0b688828b660",
      "source": "NG-LIVE::L1-75aa03e2e41a",
      "target": "NG-LIVE::L1-c07caaa8a581",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-bb34104bb75d",
      "source": "NG-LIVE::L1-2048b318bbae",
      "target": "NG-LIVE::L1-c43c8ba34e2a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-281dbb03a0ca",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-c7423b9ead02",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-5c58af6fca87",
      "source": "NG-LIVE::L1-0cf6b81ccad3",
      "target": "NG-LIVE::L1-cad2e12887ec",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-5c65d4918546",
      "source": "NG-LIVE::L1-8a45f3c98073",
      "target": "NG-LIVE::L1-cad2e12887ec",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-70145d7beafe",
      "source": "NG-LIVE::L1-c43c8ba34e2a",
      "target": "NG-LIVE::L1-d1bdb4c5d342",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-6cea45b50d2f",
      "source": "NG-LIVE::L1-a381d7802a29",
      "target": "NG-LIVE::L1-d286e3e89d82",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-14752dd7f009",
      "source": "NG-LIVE::L1-0e323358a165",
      "target": "NG-LIVE::L1-d4ff110f67db",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-264c0b773a60",
      "source": "NG-LIVE::L1-22c6be90d64f",
      "target": "NG-LIVE::L1-d4ff110f67db",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-341e3a16f83c",
      "source": "NG-LIVE::L1-b4c54b6c69b8",
      "target": "NG-LIVE::L1-d4ff110f67db",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-0959fa9c3eee",
      "source": "NG-LIVE::L1-453eccbb0a35",
      "target": "NG-LIVE::L1-d6369619065a",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-2aec0272f23b",
      "source": "NG-LIVE::L1-75aa03e2e41a",
      "target": "NG-LIVE::L1-d6581f875d9c",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-63e4a66fa080",
      "source": "NG-LIVE::L1-512ef780b683",
      "target": "NG-LIVE::L1-ded7143f47df",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-02399a4b11b4",
      "source": "NG-LIVE::L1-58acd55497c8",
      "target": "NG-LIVE::L1-ded7143f47df",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-c45161a21baa",
      "source": "NG-LIVE::L1-7784f299a66d",
      "target": "NG-LIVE::L1-ea98fce1143f",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-ea4f1e3d373c",
      "source": "NG-LIVE::L1-22c6be90d64f",
      "target": "NG-LIVE::L1-eda79c527273",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-baa4e21103a0",
      "source": "NG-LIVE::L1-0cf6b81ccad3",
      "target": "NG-LIVE::L1-ee10420f7ea6",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-ebd8f532e76e",
      "source": "NG-LIVE::L1-0cf6b81ccad3",
      "target": "NG-LIVE::L1-f05e7ebb93bc",
      "type": "direct"
    },
    {
      "id": "NG-LIVE::L1E-ad7541d2168a",
      "source": "NG-LIVE::L1-7784f299a66d",
      "target": "NG-LIVE::L1-f05e7ebb93bc",
      "type": "reference"
    },
    {
      "id": "NG-LIVE::L1E-f57f1e76f292",
      "source": "NG-LIVE::L1-a381d7802a29",
      "target": "NG-LIVE::L1-f77ffc164884",
      "type": "direct"
    }
  ]
};
