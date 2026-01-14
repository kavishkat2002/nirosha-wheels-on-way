-- Enable Realtime for these tables if not already enabled
-- 1. Create table for Chat Sessions
create type chat_status as enum ('active', 'pending', 'resolved');
create type sender_type as enum ('user', 'agent');

create table support_chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  guest_name text,
  guest_phone text,
  status chat_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create table for Messages
create table support_messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references support_chats(id) on delete cascade not null,
  sender sender_type not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS (Row Level Security) - Simplified for demo
alter table support_chats enable row level security;
alter table support_messages enable row level security;

-- Policies (Adjust strictness as needed)
-- Allow anyone to create a chat (for guests)
create policy "Enable insert for everyone" on support_chats for insert with check (true);
create policy "Enable select for everyone" on support_chats for select using (true);
create policy "Enable update for everyone" on support_chats for update using (true);

create policy "Enable insert for everyone" on support_messages for insert with check (true);
create policy "Enable select for everyone" on support_messages for select using (true);
create policy "Enable update for everyone" on support_messages for update using (true);

-- 4. Enable Realtime
alter publication supabase_realtime add table support_chats;
alter publication supabase_realtime add table support_messages;
