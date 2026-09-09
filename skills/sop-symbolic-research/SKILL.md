---
name: sop-symbolic-research
description: Extinde programul de cercetare prin circuite SOP executabile și dovezi experimentale delimitate.
---

# SOP ca reprezentare canonică

Aplicați AGENTS.md și profilul documentat în docs/SOP_PROFILE.md. Începeți cu un exemplu executabil care folosește numai comenzi existente. Extindeți biblioteca prin .sop. Introduceți un .mjs numai pentru un mecanism generic justificat, niciodată pentru a ascunde răspunsul unui domeniu sau al unui benchmark.

Înregistrați pentru fiecare experiment intrarea exactă a learner-ului, biasul de căutare, limitele de buget, separarea train/validation/test, forma generalizării și oracle-ul de evaluare. Un câmp din JSON nu este suficient ca dovadă: trebuie să existe o verificare care îl calculează. Includeți teste negative și măsurați cât de multe cazuri structurale distincte există.

Păstrați sursa SOP ca program efectiv executat. Structurile AST interne sunt permise, dar nu creați un evaluator de reguli separat și un export decorativ SOP. Sursele istorice rămân istorice. Actualizați STATUS.md, raportul, rezultatele și manifestul numai după reexecutare și review.
