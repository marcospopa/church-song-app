-- Insert sample church
INSERT INTO churches (id, name, address, phone, email, pastor_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Grace Community Church', '123 Main Street, Anytown, ST 12345', '(555) 123-4567', 'info@gracechurch.com', 'Rev. John Smith');

-- Insert sample members
INSERT INTO members (id, church_id, email, name, phone, role, instruments, status, join_date) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'sarah@church.com', 'Sarah Johnson', '(555) 123-4567', 'Worship Leader', ARRAY['Vocals', 'Piano'], 'active', '2022-01-15'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'mike@church.com', 'Mike Chen', '(555) 234-5678', 'Guitarist', ARRAY['Electric Guitar', 'Acoustic Guitar'], 'active', '2022-03-20'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'emily@church.com', 'Emily Rodriguez', '(555) 345-6789', 'Vocalist', ARRAY['Vocals'], 'active', '2022-06-10'),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'david@church.com', 'David Kim', '(555) 456-7890', 'Drummer', ARRAY['Drums', 'Percussion'], 'active', '2021-11-05'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'lisa@church.com', 'Lisa Thompson', '(555) 567-8901', 'Bassist', ARRAY['Bass Guitar'], 'inactive', '2023-02-14');

-- Insert sample songs
INSERT INTO songs (id, church_id, title, artist, key, tempo, genre, lyrics, chords, tags, last_used) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Amazing Grace', 'John Newton', 'G', 72, 'Hymn', 'Amazing grace how sweet the sound...', 'G - C - G - D - G', ARRAY['Classic', 'Slow'], '2024-01-07'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'How Great Thou Art', 'Carl Boberg', 'C', 80, 'Hymn', 'O Lord my God when I in awesome wonder...', 'C - F - C - G - C', ARRAY['Classic', 'Powerful'], '2024-01-07'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Blessed Be Your Name', 'Matt Redman', 'D', 120, 'Contemporary', 'Blessed be your name in the land that is plentiful...', 'D - A - Bm - G', ARRAY['Upbeat', 'Praise'], '2024-01-03'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Here I Am to Worship', 'Tim Hughes', 'E', 76, 'Contemporary', 'Light of the world you stepped down into darkness...', 'E - A - C#m - B', ARRAY['Worship', 'Intimate'], '2023-12-31'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', '10,000 Reasons', 'Matt Redman', 'G', 73, 'Contemporary', 'Bless the Lord O my soul...', 'G - C - Em - D', ARRAY['Worship', 'Gratitude'], '2023-12-24');

-- Insert sample setlists
INSERT INTO setlists (id, church_id, name, service_date, service_type, status, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'Sunday Morning Worship', '2024-01-14', 'Sunday Service', 'active', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'Prayer Night Intimate', '2024-01-17', 'Prayer Night', 'draft', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', 'New Year Celebration', '2024-01-21', 'Sunday Service', 'active', '550e8400-e29b-41d4-a716-446655440001');

-- Insert setlist songs
INSERT INTO setlist_songs (setlist_id, song_id, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 1),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', 2),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440012', 3),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440013', 1),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440014', 2);

-- Insert sample events
INSERT INTO events (id, church_id, title, event_date, event_time, event_type, location, setlist_id, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'Sunday Morning Worship', '2024-01-14', '10:00:00', 'service', 'Main Sanctuary', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'Worship Team Rehearsal', '2024-01-16', '19:00:00', 'rehearsal', 'Music Room', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'Prayer Night', '2024-01-17', '19:00:00', 'service', 'Chapel', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001');

-- Insert event participants
INSERT INTO event_participants (event_id, member_id, role, status) VALUES 
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', 'leader', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440002', 'guitarist', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 'vocalist', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440004', 'drummer', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', 'leader', 'confirmed'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', 'vocalist', 'confirmed');
