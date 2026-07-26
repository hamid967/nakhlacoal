DROP POLICY IF EXISTS "Users manage their own messages" ON public.chat_messages;

CREATE POLICY "Users read their own messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert messages into their conversations" ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update their own messages" ON public.chat_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete their own messages" ON public.chat_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);