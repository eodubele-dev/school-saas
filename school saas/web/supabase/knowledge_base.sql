-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store knowledge base documents
create table public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  content text not null, -- The text content (chunk)
  embedding vector(768), -- Embedding vector (Gemini 1.5 likely uses 768 dims)
  metadata jsonb default '{}'::jsonb, -- e.g. { topic: "grading", source: "manual" }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.knowledge_base enable row level security;

-- Allow read access to all authenticated users (or restrict as needed)
create policy "Knowledge base is public to auth users" on public.knowledge_base
  for select using (auth.role() = 'authenticated');

-- Function to search for similar documents
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    public.knowledge_base.id,
    public.knowledge_base.content,
    1 - (public.knowledge_base.embedding <=> query_embedding) as similarity
  from public.knowledge_base
  where 1 - (public.knowledge_base.embedding <=> query_embedding) > match_threshold
  order by public.knowledge_base.embedding <=> query_embedding
  limit match_count;
end;
$$;
