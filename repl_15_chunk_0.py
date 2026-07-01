        except Exception as exc:
            logger.warning(f"Sea service LLM pass failed: {exc}\n{traceback.format_exc()}")
            print("[Stage 2 / Pass 2] Falling back to local regex for sea service.")
            
        time.sleep(2)
        
        # -- Pass 3: Personal Details (Section 1) -----------------------------
        print("[Stage 2 / Pass 3] LLM extraction - Personal Details (Section 1)...")
        try:
            pd_prompt = _build_personal_details_prompt(text)
            pd_result = _call_llm_with_retry(llm, pd_prompt, _PersonalDetailsResult)
            if pd_result and pd_result.personal_details:
                # Override the local extraction with the highly accurate LLM extraction
                local_result["1_personal_details"] = pd_result.personal_details.model_dump()
                print("[Stage 2 / Pass 3] Extracted Personal Details via LLM successfully.")
            else:
                print("[Stage 2 / Pass 3] LLM returned empty - keeping local results.")
        except Exception as exc:
            logger.warning(f"Personal details LLM pass failed: {exc}\n{traceback.format_exc()}")
            print("[Stage 2 / Pass 3] Falling back to local regex for personal details.")
            
    else:
