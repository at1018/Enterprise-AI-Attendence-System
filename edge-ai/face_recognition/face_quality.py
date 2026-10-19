"""
Face Quality Check System
Evaluates face image quality for enrollment and recognition
"""

import cv2
import numpy as np
from typing import Dict, Optional
from logging.logger import get_logger

class FaceQualityChecker:
    """Evaluates face image quality using various metrics"""
    
    def __init__(self, logger=None):
        """
        Initialize face quality checker
        
        Args:
            logger: Logger instance
        """
        self.logger = logger or get_logger("FaceQualityChecker")
        
        # Quality thresholds
        self.min_face_size = 100  # Minimum face size in pixels
        self.min_brightness = 50   # Minimum brightness (0-255)
        self.max_brightness = 200  # Maximum brightness (0-255)
        self.min_sharpness = 50    # Minimum sharpness score
        self.min_contrast = 30     # Minimum contrast score
    
    def check_quality(self, face_image: np.ndarray, face_bbox: tuple) -> Dict[str, float]:
        """
        Check overall face quality
        
        Args:
            face_image: Full image containing face
            face_bbox: Face bounding box (x, y, width, height)
            
        Returns:
            Dictionary with quality metrics and overall score
        """
        # Extract face region
        x, y, w, h = face_bbox
        face_region = face_image[y:y+h, x:x+w]
        
        # Calculate individual quality metrics
        size_score = self._check_face_size(w, h)
        brightness_score = self._check_brightness(face_region)
        sharpness_score = self._check_sharpness(face_region)
        contrast_score = self._check_contrast(face_region)
        
        # Calculate overall quality score (weighted average)
        overall_score = (
            size_score * 0.3 +
            brightness_score * 0.25 +
            sharpness_score * 0.25 +
            contrast_score * 0.2
        )
        
        quality_metrics = {
            'overall': overall_score,
            'size': size_score,
            'brightness': brightness_score,
            'sharpness': sharpness_score,
            'contrast': contrast_score
        }
        
        self.logger.debug(f"Face quality: {quality_metrics}")
        
        return quality_metrics
    
    def _check_face_size(self, width: int, height: int) -> float:
        """
        Check if face size is adequate
        
        Args:
            width: Face width in pixels
            height: Face height in pixels
            
        Returns:
            Size score (0-1)
        """
        face_size = min(width, height)
        
        if face_size >= self.min_face_size * 2:
            return 1.0  # Excellent size
        elif face_size >= self.min_face_size:
            # Linear interpolation between min and excellent
            return 0.5 + 0.5 * ((face_size - self.min_face_size) / self.min_face_size)
        else:
            return 0.0  # Too small
    
    def _check_brightness(self, face_image: np.ndarray) -> float:
        """
        Check image brightness
        
        Args:
            face_image: Face region
            
        Returns:
            Brightness score (0-1)
        """
        # Convert to grayscale
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        
        # Calculate mean brightness
        mean_brightness = np.mean(gray)
        
        # Check if within acceptable range
        if self.min_brightness <= mean_brightness <= self.max_brightness:
            return 1.0  # Good brightness
        elif mean_brightness < self.min_brightness:
            # Too dark
            return max(0, mean_brightness / self.min_brightness)
        else:
            # Too bright
            return max(0, (255 - mean_brightness) / (255 - self.max_brightness))
    
    def _check_sharpness(self, face_image: np.ndarray) -> float:
        """
        Check image sharpness using Laplacian variance
        
        Args:
            face_image: Face region
            
        Returns:
            Sharpness score (0-1)
        """
        # Convert to grayscale
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        
        # Calculate Laplacian variance (measure of blur)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Normalize to 0-1 range
        sharpness_score = min(1.0, laplacian_var / self.min_sharpness)
        
        return sharpness_score
    
    def _check_contrast(self, face_image: np.ndarray) -> float:
        """
        Check image contrast using standard deviation
        
        Args:
            face_image: Face region
            
        Returns:
            Contrast score (0-1)
        """
        # Convert to grayscale
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        
        # Calculate standard deviation
        std_dev = np.std(gray)
        
        # Normalize to 0-1 range
        contrast_score = min(1.0, std_dev / self.min_contrast)
        
        return contrast_score
    
    def is_acceptable_quality(self, quality_metrics: Dict[str, float], threshold: float = 0.6) -> bool:
        """
        Check if face quality meets threshold
        
        Args:
            quality_metrics: Quality metrics from check_quality
            threshold: Minimum acceptable quality score
            
        Returns:
            True if quality is acceptable
        """
        overall_score = quality_metrics.get('overall', 0.0)
        return overall_score >= threshold
