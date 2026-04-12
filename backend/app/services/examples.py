class ExampleService:
    def list_examples(self) -> list[dict[str, str]]:
        return [
            {
                "id": "benchmark_press_release",
                "title": "Benchmark-style mixed factual paragraph",
                "dataset": "benchmark",
            },
            {
                "id": "recent_news_headline",
                "title": "Recent-news style headline bundle",
                "dataset": "recent_news",
            },
        ]
