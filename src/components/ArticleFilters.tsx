type ArticleFiltersProps = {
  tags: string[]
  active: string
  onChange: (tag: string) => void
}

export function ArticleFilters({ tags, active, onChange }: ArticleFiltersProps) {
  const options = ['All', ...tags]

  return (
    <div className="article-filters" role="tablist" aria-label="Filter articles">
      {options.map((tag) => {
        const selected = active === tag
        return (
          <button
            key={tag}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`article-filters__pill${selected ? ' article-filters__pill--active' : ''}`}
            onClick={() => onChange(tag)}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
