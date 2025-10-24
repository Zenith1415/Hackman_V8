"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import styles from '@/styles/Dashboard.module.css';

interface PaymentData {
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
  paymentProof?: string;
  paymentDate?: string;
}

interface PaymentManagementProps {
  teamData: {
    _id: string;
    teamName: string;
    selectionStatus: 'pending' | 'selected' | 'waitlisted' | 'rejected';
    paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'verified';
    paymentProof?: string;
    paymentDate?: string;
  };
  onUpdate: (updatedData: Partial<PaymentData>) => void;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ teamData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentStatus: teamData.paymentStatus || 'unpaid',
    paymentProof: teamData.paymentProof || '',
    paymentDate: teamData.paymentDate || '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing payment data on component mount
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        const response = await fetch(`/api/team/payment?teamId=${teamData._id}`);
        if (response.ok) {
          const data = await response.json();
          setPaymentData({
            paymentStatus: data.paymentStatus || 'unpaid',
            paymentProof: data.paymentProof || '',
            paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString().split('T')[0] : '',
          });
        }
      } catch (error) {
        console.error('Failed to load payment data:', error);
      }
    };

    loadPaymentData();
  }, [teamData._id]);

  // Only show payment section for selected teams
  if (teamData.selectionStatus !== 'selected') {
    return null;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPaymentData(prev => ({ ...prev, paymentProof: result }));
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (!paymentData.paymentProof) {
        toast.error('Please upload a payment proof image');
        return;
      }

      if (!paymentData.paymentDate) {
        toast.error('Please select a payment date');
        return;
      }

      // Create FormData for API submission
      const formData = new FormData();
      formData.append('teamId', teamData._id);
      formData.append('paymentDate', paymentData.paymentDate);

      // Convert base64 image back to File for upload
      if (paymentData.paymentProof.startsWith('data:')) {
        const response = await fetch(paymentData.paymentProof);
        const blob = await response.blob();
        const file = new File([blob], 'payment-proof.jpg', { type: 'image/jpeg' });
        formData.append('paymentProof', file);
      }

      const response = await fetch('/api/team/payment', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Update local state with server response
        onUpdate({
          paymentStatus: 'paid',
          paymentProof: paymentData.paymentProof,
          paymentDate: paymentData.paymentDate,
        });
        
        // Refresh payment data from server
        const refreshResponse = await fetch(`/api/team/payment?teamId=${teamData._id}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setPaymentData({
            paymentStatus: refreshData.paymentStatus || 'paid',
            paymentProof: refreshData.paymentProof || paymentData.paymentProof,
            paymentDate: refreshData.paymentDate ? new Date(refreshData.paymentDate).toISOString().split('T')[0] : paymentData.paymentDate,
          });
        }
        
        setIsEditing(false);
        toast.success('Payment proof submitted successfully!');
      } else {
        toast.error(result.error || 'Failed to submit payment proof');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment proof');
    }
  };

  const handleCancel = () => {
    setPaymentData({
      paymentStatus: teamData.paymentStatus || 'unpaid',
      paymentProof: teamData.paymentProof || '',
      paymentDate: teamData.paymentDate || '',
    });
    setPreviewImage(null);
    setIsEditing(false);
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'paid':
        return '#10b981';
      case 'verified':
        return '#059669';
      case 'unpaid':
      default:
        return '#ef4444';
    }
  };

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'paid':
        return '💳';
      case 'verified':
        return '✅';
      case 'unpaid':
      default:
        return '❌';
    }
  };

  return (
    <div className={styles.paymentSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Payment Management</h3>
        <div className={styles.paymentStatus}>
          <span className={styles.statusIcon}>{getPaymentStatusIcon(paymentData.paymentStatus)}</span>
          <span 
            className={styles.statusText}
            style={{ color: getPaymentStatusColor(paymentData.paymentStatus) }}
          >
            {paymentData.paymentStatus?.toUpperCase() || 'UNPAID'}
          </span>
        </div>
      </div>

      {/* QR Code Display */}
      <div className={styles.qrSection}>
        <h4 className={styles.qrTitle}>Payment QR Code</h4>
        <div className={styles.qrContainer}>
          <Image
            src="/pay__mentt.jpg"
            alt="Payment QR Code"
            width={300}
            height={300}
            className={styles.qrImage}
          />
          <div className={styles.qrInfo}>
            <p className={styles.qrAmount}>Amount: ₹{process.env.NEXT_PUBLIC_FEES || '800'}</p>
            <p className={styles.qrInstructions}>
              Scan this QR code with any UPI app to make payment
            </p>
          </div>
        </div>
      </div>

      {/* Payment Proof Section */}
      <div className={styles.proofSection}>
        <h4 className={styles.proofTitle}>Payment Proof</h4>
        
        {!isEditing ? (
          <div className={styles.proofDisplay}>
            {paymentData.paymentProof ? (
              <div className={styles.proofPreview}>
                <img 
                  src={paymentData.paymentProof} 
                  alt="Payment Proof" 
                  className={styles.proofImage}
                />
                <div className={styles.proofDetails}>
                  <p><strong>Date:</strong> {paymentData.paymentDate || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div className={styles.noProof}>
                <p>No payment proof uploaded yet</p>
              </div>
            )}
            <button 
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              {paymentData.paymentProof ? 'Edit Proof' : 'Upload Proof'}
            </button>
          </div>
        ) : (
          <div className={styles.proofForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Payment Proof Image</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className={styles.fileInput}
              />
              {previewImage && (
                <div className={styles.imagePreview}>
                  <img src={previewImage} alt="Preview" className={styles.previewImage} />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Payment Date</label>
              <input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                className={styles.formInput}
              />
            </div>

            <div className={styles.formActions}>
              <button 
                className={styles.saveButton}
                onClick={handleSave}
              >
                Save Payment Proof
              </button>
              <button 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className={styles.instructionsSection}>
        <h4 className={styles.instructionsTitle}>Payment Instructions</h4>
        <div className={styles.instructionsList}>
          <div className={styles.instructionItem}>
            <span className={styles.instructionNumber}>1</span>
            <p>Scan the QR code above with any UPI app (PhonePe, Google Pay, Paytm, etc.)</p>
          </div>
          <div className={styles.instructionItem}>
            <span className={styles.instructionNumber}>2</span>
            <p>Enter the exact amount: ₹{process.env.NEXT_PUBLIC_FEES || '800'}</p>
          </div>
          <div className={styles.instructionItem}>
            <span className={styles.instructionNumber}>3</span>
            <p>Complete the payment and take a screenshot of the payment confirmation</p>
          </div>
          <div className={styles.instructionItem}>
            <span className={styles.instructionNumber}>4</span>
            <p>Upload the payment proof using the form above</p>
          </div>
          <div className={styles.instructionItem}>
            <span className={styles.instructionNumber}>5</span>
            <p>Wait for verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
