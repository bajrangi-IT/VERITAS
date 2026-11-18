"""
VERITAS AI - Core Autonomous Web Research Engine
Decomposes complex research questions dynamically, runs parallel bounded searches, and normalizes sources.
"""

import asyncio
from typing import List
from backend.app.models.contracts import Source, ResearchDomain, ResearchDepth
from backend.app.research.search_provider import HybridSearchProvider, BaseSearchProvider
from backend.app.research.deduplication import deduplicate_sources
from backend.app.core.config import settings
from backend.app.core.logging import logger


class ResearchEngine:
    """Core information retrieval engine with bounded concurrency and deduplication."""
    def __init__(self, search_provider: BaseSearchProvider = None):
        self.provider = search_provider or HybridSearchProvider()
        self._semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_SEARCHES)

    def decompose_query(self, query: str, depth: ResearchDepth) -> List[str]:
        """
        Dynamically generates targeted research subquestions based on inquiry intent.
        Always begins with the exact raw query, followed by objective investigative angles.
        """
        clean_q = query.strip()
        count = 3 if depth == ResearchDepth.BRIEF else (4 if depth == ResearchDepth.STANDARD else 6)

        subquestions = [
            clean_q,  # Primary raw query first
            f"Empirical evidence and published data regarding {clean_q}",
            f"Verified findings and primary documentation on {clean_q}",
            f"Counter-perspectives, conflicting evidence, and limitations concerning {clean_q}",
            f"Systematic review and observational outcomes for {clean_q}",
            f"Longitudinal studies and critical analysis of {clean_q}"
        ]
        return subquestions[:count]

    async def _execute_single_search(self, subquery: str, domain: ResearchDomain, limit_per_query: int) -> List[Source]:
        async with self._semaphore:
            try:
                return await self.provider.search(subquery, domain, limit_per_query)
            except Exception as e:
                logger.warning(f"Subquery search error for '{subquery}': {str(e)}")
                return []

    async def execute_research(
        self,
        query: str,
        domain: ResearchDomain = ResearchDomain.GENERAL,
        depth: ResearchDepth = ResearchDepth.STANDARD,
        max_sources: int = 8
    ) -> List[Source]:
        """
        Executes parallel searches across all decomposed subquestions,
        normalizes the results, and deduplicates the sources.
        """
        subqueries = self.decompose_query(query, depth)
        logger.info(f"Decomposed '{query}' into {len(subqueries)} targeted analytical tracks.")

        limit_per_query = max(2, max_sources // len(subqueries) + 1)
        tasks = [
            self._execute_single_search(sq, domain, limit_per_query)
            for sq in subqueries
        ]

        all_results = await asyncio.gather(*tasks)
        flat_sources: List[Source] = []
        for res_list in all_results:
            flat_sources.extend(res_list)

        # Deduplicate and sort by credibility score
        deduped = deduplicate_sources(flat_sources)
        deduped.sort(key=lambda s: s.credibility_score, reverse=True)

        selected = deduped[:max_sources]
        logger.info(f"Retrieved and normalized {len(selected)} unique sources for inquiry: '{query}'.")
        return selected
