from deepface import DeepFace
import cv2
import multiprocessing
import time
import traceback

def emotion_worker(frame_queue, result_queue):
    while True:
        try:
            frame = frame_queue.get(timeout=5)  # Wait max 5s for a frame
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            emotions = result[0]['emotion']
            dominant_emotion = result[0]['dominant_emotion']
            result_queue.put((dominant_emotion, emotions))
        except Exception as e:
            result_queue.put(("Error", {}))
            print("Emotion worker error:", str(e))
            traceback.print_exc()

if __name__ == '__main__':
    multiprocessing.set_start_method('spawn', force=True)

    cap = cv2.VideoCapture(3)
    cv2.namedWindow("Realtime Emotion Detection", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Realtime Emotion Detection", 600, 400)

    frame_queue = multiprocessing.Queue(maxsize=2)
    result_queue = multiprocessing.Queue()

    p = multiprocessing.Process(target=emotion_worker, args=(frame_queue, result_queue))
    p.daemon = True
    p.start()

    dominant_emotion = "Detecting..."
    emotion_scores = {}
    frame_skip = 15
    frame_count = 0
    last_result_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (600, 400))
        frame_count += 1

        # Send frame if enough time passed and queue is empty
        if frame_count % frame_skip == 0 and frame_queue.empty():
            try:
                frame_queue.put_nowait(frame.copy())
            except:
                pass  # queue full

        # Check for result with timeout logic
        if not result_queue.empty():
            dominant_emotion, emotion_scores = result_queue.get()
            last_result_time = time.time()
            if dominant_emotion == "Error":
                dominant_emotion = "Detecting..."

        # Fallback if no result for 10+ seconds
        if time.time() - last_result_time > 10:
            dominant_emotion = "No response"
            emotion_scores = {}

        # Display
        cv2.putText(frame, f'Emotion: {dominant_emotion}', (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        y_offset = 70
        for emo, score in emotion_scores.items():
            cv2.putText(frame, f"{emo}: {score:.1f}%", (20, y_offset),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            y_offset += 20

        cv2.imshow("Realtime Emotion Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    p.terminate()
