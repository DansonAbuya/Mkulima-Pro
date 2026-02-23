-- Create advisories table
CREATE TABLE IF NOT EXISTS public.advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES public.profiles(id),
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

-- Create policies for advisories (everyone can read, only advisors can write)
CREATE POLICY "Anyone can view advisories" ON public.advisories FOR SELECT USING (true);

CREATE POLICY "Advisors can create advisories" ON public.advisories 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'advisor'
    )
  );

CREATE POLICY "Advisors can update their own advisories" ON public.advisories 
  FOR UPDATE 
  USING (author_id = auth.uid());

-- Create user_advisory_interactions table for tracking likes/saves
CREATE TABLE IF NOT EXISTS public.user_advisory_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  advisory_id UUID NOT NULL REFERENCES public.advisories(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'like', 'save')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, advisory_id, action)
);

-- Enable RLS
ALTER TABLE public.user_advisory_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for interactions
CREATE POLICY "Users can manage their own interactions" ON public.user_advisory_interactions 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert sample advisories
INSERT INTO public.advisories (title, content, category) VALUES
('Best Practices for Maize Farming', 'Maize is one of the most important crops in Kenya. To maximize your yield, follow these proven practices: proper land preparation, timely planting, adequate fertilization...', 'Crop Management'),
('Soil Health Management', 'Healthy soil is the foundation of successful farming. Implement crop rotation, add organic matter through composting, and conduct regular soil tests...', 'Soil Management'),
('Pest Control Strategies', 'Integrated pest management (IPM) is essential for sustainable farming. Use cultural practices, biological controls, and chemical pesticides only as a last resort...', 'Pest Management'),
('Water Conservation Techniques', 'With climate change affecting rainfall patterns, efficient water use is critical. Install drip irrigation, use mulching, and harvest rainwater...', 'Water Management'),
('Organic Farming Methods', 'Organic farming reduces input costs and improves soil health. Eliminate synthetic pesticides and fertilizers, use compost and natural pest control...', 'Sustainable Agriculture'),
('Smallholder Vegetable Production', 'Vegetables offer quick returns and better profit margins than cereals. Focus on high-value crops like tomatoes, peppers, and leafy greens...', 'Vegetable Farming');
