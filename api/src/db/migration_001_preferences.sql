-- 임원 선호도 필드 추가
ALTER TABLE executives ADD COLUMN preferred_airline TEXT DEFAULT '';
ALTER TABLE executives ADD COLUMN seat_class TEXT DEFAULT '비즈니스';
ALTER TABLE executives ADD COLUMN hotel_grade TEXT DEFAULT '5성';
ALTER TABLE executives ADD COLUMN preferred_hotel_chain TEXT DEFAULT '';
ALTER TABLE executives ADD COLUMN dietary TEXT DEFAULT '';
ALTER TABLE executives ADD COLUMN passport_no TEXT DEFAULT '';
ALTER TABLE executives ADD COLUMN passport_expiry TEXT DEFAULT '';
