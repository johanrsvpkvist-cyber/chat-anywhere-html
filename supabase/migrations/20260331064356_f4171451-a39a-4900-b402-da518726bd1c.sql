
-- Create messages table for the chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read messages
CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT USING (true);

-- Anyone can insert messages
CREATE POLICY "Anyone can insert messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);

-- Anyone can view chat images
CREATE POLICY "Anyone can view chat images" ON storage.objects FOR SELECT USING (bucket_id = 'chat-images');

-- Anyone can upload chat images
CREATE POLICY "Anyone can upload chat images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-images');
