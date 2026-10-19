"""
Face Detection Module
Detects faces in images using OpenCV (foundation implementation)
"""

import cv2
import numpy as np
from typing import List, Tuple, Optional
from logging.logger import get_logger

class FaceDetector:
    """Face detection using OpenCV Haar Cascades (foundation)"""
    
    def __init__(self, logger=None):
        """
        Initialize face detector
        
        Args:
            logger: Logger instance
        """
        self.logger = logger or get_logger("FaceDetector")
        self.face_cascade = None
        self._load_cascade()
    
    def _load_cascade(self):
        """Load OpenCV face cascade classifier"""
        try:
            # Use OpenCV's built-in Haar cascade
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            self.logger.info("Face cascade loaded successfully")
        except Exception as e:
            self.logger.error(f"Failed to load face cascade: {e}")
            self.face_cascade = None
    
    def detect_faces(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in an image
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            List of face bounding boxes as (x, y, width, height)
        """
        if self.face_cascade is None:
            self.logger.warning("Face cascade not loaded, returning empty list")
            return []
        
        try:
            # Convert to grayscale for detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            self.logger.debug(f"Detected {len(faces)} faces")
            return [(int(x), int(y), int(w), int(h)) for x, y, w, h in faces]
            
        except Exception as e:
            self.logger.error(f"Face detection failed: {e}")
            return []
    
    def extract_face_region(self, image: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
        """
        Extract face region from image
        
        Args:
            image: Input image
            bbox: Face bounding box (x, y, width, height)
            
        Returns:
            Face region as numpy array
        """
        x, y, w, h = bbox
        return image[y:y+h, x:x+w]
    
    def detect_and_extract(self, image: np.ndarray) -> List[np.ndarray]:
        """
        Detect faces and extract face regions
        
        Args:
            image: Input image
            
        Returns:
            List of face regions
        """
        faces = self.detect_faces(image)
        return [self.extract_face_region(image, face) for face in faces]
