# 🎤 Voice Recording Feature

## Tính năng ghi chú bằng giọng nói

Ứng dụng Simple Notes App đã được tích hợp tính năng ghi chú bằng giọng nói sử dụng Web Speech API.

### ✨ Tính năng chính

- **🎙️ Ghi âm giọng nói**: Chuyển đổi giọng nói thành văn bản real-time
- **🇻🇳 Hỗ trợ tiếng Việt**: Nhận diện giọng nói tiếng Việt chính xác
- **📝 Tích hợp seamless**: Thêm vào cả form tạo mới và chỉnh sửa ghi chú
- **🔄 Preview real-time**: Xem nội dung được nhận diện ngay lập tức
- **✅ Xác nhận linh hoạt**: Có thể xác nhận hoặc làm mới transcript

### 🚀 Cách sử dụng

#### Tạo ghi chú mới bằng giọng nói:
1. Nhấn nút **"Ghi âm"** trong form tạo ghi chú
2. Cho phép trình duyệt truy cập microphone
3. Nhấn **"Bắt đầu ghi âm"** và nói nội dung
4. Nhấn **"Xác nhận"** để thêm vào ghi chú
5. Tạo ghi chú như bình thường

#### Chỉnh sửa ghi chú bằng giọng nói:
1. Nhấn **"Edit"** trên ghi chú muốn chỉnh sửa
2. Nhấn nút **"Ghi âm"** trong form edit
3. Thực hiện tương tự như tạo mới

### 🛠️ Technical Details

#### Components được thêm:
- `useSpeechRecognition.ts` - Custom hook for speech recognition
- `VoiceRecorder.tsx` - UI component cho voice recording
- Tích hợp vào `NotesApp.tsx`

#### APIs sử dụng:
- **Web Speech API**: `SpeechRecognition` / `webkitSpeechRecognition`
- **Language**: vi-VN (tiếng Việt)
- **Features**: Continuous recognition, interim results

#### Browser Support:
- ✅ Chrome/Chromium browsers
- ✅ Edge
- ❌ Firefox (limited support)
- ❌ Safari (limited support)

### 🔧 Configuration

Voice recognition được cấu hình với:
```javascript
recognition.continuous = true;        // Ghi âm liên tục
recognition.interimResults = true;    // Hiển thị kết quả tạm thời
recognition.lang = 'vi-VN';          // Ngôn ngữ tiếng Việt
```

### 🚨 Lưu ý quan trọng

1. **HTTPS Required**: Tính năng chỉ hoạt động trên HTTPS hoặc localhost
2. **Microphone Permission**: Cần cấp quyền truy cập microphone
3. **Browser Compatibility**: Chỉ hỗ trợ trình duyệt Chrome-based
4. **Internet Connection**: Cần kết nối internet để speech recognition hoạt động

### 🎯 Future Enhancements

- [ ] Hỗ trợ nhiều ngôn ngữ khác
- [ ] Offline speech recognition
- [ ] Custom voice commands (hashtags, formatting)
- [ ] Voice note playback
- [ ] Noise reduction and better accuracy

### 🐛 Troubleshooting

**Lỗi "Speech recognition không được hỗ trợ":**
- Sử dụng Chrome/Edge thay vì Firefox/Safari
- Đảm bảo chạy trên HTTPS hoặc localhost

**Microphone không hoạt động:**
- Kiểm tra quyền truy cập microphone trong browser settings
- Đảm bảo microphone không bị các ứng dụng khác sử dụng

**Không nhận diện được tiếng Việt:**
- Nói rõ ràng và không quá nhanh
- Đảm bảo có kết nối internet ổn định
- Thử refresh trang và cấp quyền lại

---

Được phát triển với ❤️ sử dụng React, TypeScript và Web Speech API.
