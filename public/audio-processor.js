// public/audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetSampleRate = 16000;
    this.bufferSize = null;
    this.buffer = null;
    this.bufferIndex = 0;
    this.chunkCount = 0;
    this.initialized = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (!input || !input[0]) {
      return true;
    }

    if (!this.initialized) {
      this.bufferSize = Math.floor(sampleRate * 0.1);
      this.buffer = new Float32Array(this.bufferSize);
      this.initialized = true;
    }

    const inputChannel = input[0];
    
    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex++] = inputChannel[i];
      
      if (this.bufferIndex >= this.bufferSize) {
        this.chunkCount++;
        
        let sum = 0;
        for (let j = 0; j < this.bufferSize; j++) {
          sum += this.buffer[j] * this.buffer[j];
        }
        const rms = Math.sqrt(sum / this.bufferSize);
        const dbFS = rms > 0 ? 20 * Math.log10(rms) : -100;
        
        const needsResampling = sampleRate !== this.targetSampleRate;
        let outputData;
        
        if (needsResampling) {
          const ratio = sampleRate / this.targetSampleRate;
          const outputLength = Math.floor(this.bufferSize / ratio);
          outputData = new Float32Array(outputLength);
          
          for (let j = 0; j < outputLength; j++) {
            const sourceIndex = j * ratio;
            const index = Math.floor(sourceIndex);
            const fraction = sourceIndex - index;
            
            if (index + 1 < this.bufferSize) {
              outputData[j] = this.buffer[index] * (1 - fraction) + this.buffer[index + 1] * fraction;
            } else {
              outputData[j] = this.buffer[index];
            }
          }
        } else {
          outputData = new Float32Array(this.buffer);
        }
        
        // Convert to Int16
        const int16Data = new Int16Array(outputData.length);
        for (let j = 0; j < outputData.length; j++) {
          const s = Math.max(-1, Math.min(1, outputData[j]));
          int16Data[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // CRITICAL: Create a COPY of the buffer before transferring
        const bufferCopy = new ArrayBuffer(int16Data.byteLength);
        new Int16Array(bufferCopy).set(int16Data);
        
        this.port.postMessage({
          audioData: bufferCopy,
          length: int16Data.length,
          rms: rms,
          dbFS: dbFS,
          chunkCount: this.chunkCount,
          sampleRate: sampleRate,
          outputSampleRate: this.targetSampleRate,
          resampled: needsResampling,
        }, [bufferCopy]);  // Transfer ownership
        
        this.bufferIndex = 0;
      }
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);