-- Fix the menopause_analysis table phase_confidence column data type
-- Change from NUMERIC(3,2) to NUMERIC(5,4) to allow proper decimal storage
ALTER TABLE public.menopause_analysis 
ALTER COLUMN phase_confidence TYPE NUMERIC(5,4);

-- Also ensure the column allows for confidence values between 0 and 1
-- Add a check constraint to validate the range if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'menopause_analysis_phase_confidence_range' 
        AND table_name = 'menopause_analysis'
    ) THEN
        ALTER TABLE public.menopause_analysis 
        ADD CONSTRAINT menopause_analysis_phase_confidence_range 
        CHECK (phase_confidence >= 0 AND phase_confidence <= 1);
    END IF;
END $$;