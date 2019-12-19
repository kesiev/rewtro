var AudioEngine={
	ready:false,
	audioContext:0,
	channels:{},
	NOISETIMES:["attack","sustain","decay","release"],
	NOISEWAVES:{
		whitenoise:function(v,i,p) { return Math.floor((i-1)/(p/2))!=Math.floor(i/(p/2))?Math.random()*2-1:v },
		square:function(v,i,p) { return ((Math.floor(i/(p/2))%-2)*-2)+1 },
		sine:function(v,i,p) { return Math.sin(i*6.28/p) },
		saw:function(v,i,p) { return ((v+1+(2/p)) % 2) - 1},
		triangle:function(v,i,p) { return Math.abs((i % p - (p/2))/p*4)-1 },
		tangent:function(v,i,p) { 
			v= 0.15*Math.tan(i/p*3.14);
			if (v<-1) v=-1;
			if (v>1) v=1;
			return v;
		},
		whistle:function(v,i,p) { return 0.75 * Math.sin(i/p*6.28) + 0.25 * Math.sin(40 *3.14 * i/p) },
		breaker:function(v,i,p) {
			v=(i/p) + 0.8660;
			v=v - Math.floor(v);
			return -1 + 2 * Math.abs(1 - v*v*2);
		}
	},
	clone:function(a) { return JSON.parse(JSON.stringify(a)); },
	request:function() {
		if (!this.ready) {
			try {
				if (window.webkitAudioContext) this.audioContext=new window.webkitAudioContext();
				else if (window.AudioContext) this.audioContext=new window.AudioContext();
				this.ready=true;
			} catch(e) {
				this.audioContext=0;
				this.ready=false;
			}
		}
	},
	generateNoise:function(parms,frequency,sample) {
		if (!sample) sample={noise:true,parms:parms,frequency:frequency};
		if (this.ready) {

			parms=this.clone(parms);

			var sampleRate = this.audioContext.sampleRate,data={};
			for (var a in parms) if (parms[a]!==undefined) data[a]=parms[a];
			for (var i=0;i<this.NOISETIMES.length;i++) data[this.NOISETIMES[i]]*=sampleRate;
			if (frequency!==undefined) data.frequency=frequency;

			var out,bits,steps,attackDecay=data.attack+data.decay,
				attackSustain=attackDecay+data.sustain,
				samplePitch = sampleRate/data.frequency,
				sampleLength = attackSustain+data.release,	

				tremolo = .9,
				value = .9,
				envelope = 0;    

			var buffer = this.audioContext.createBuffer(2,sampleLength,sampleRate);

			for(var i=0;i<2;i++) {
				var channel = buffer.getChannelData(i),
					jump1=sampleLength*data.frequencyJump1onset,
				jump2=sampleLength*data.frequencyJump2onset;
				for(var j=0; j<buffer.length; j++) {
					// ADSR Generator
					value = this.NOISEWAVES[data.wave](value,j,samplePitch);
					if (j<=data.attack) envelope=j/data.attack;
					else if (j<=attackDecay) envelope=-(j-attackDecay)/data.decay*(1-data.limit)+data.limit;
					if (j>attackSustain) envelope=(-(j-attackSustain)/data.release+1)*data.limit;
					// Tremolo
					tremolo = this.NOISEWAVES.sine(value,j,sampleRate/data.tremoloFrequency)*data.tremoloDepth+(1-data.tremoloDepth);
					out = value*tremolo*envelope*0.9;
					// Bit crush
					if (data.bitCrush||data.bitCrushSweep) {
						bits = Math.round(data.bitCrush + j / sampleLength * data.bitCrushSweep);
						if (bits<1) bits=1;
						if (bits>16) bits=16;
						steps=Math.pow(2,bits);
						out=-1 + 2 * Math.round((0.5 + 0.5 * out) * steps) / steps;
					}

					// Done!
					if (!out) out=0;
					if(out>1) out= 1;
					if(out<-1) out = -1;

					channel[j]=out;
					// Frequency jump
					if (j>=jump1) { samplePitch*=1-data.frequencyJump1amount; jump1=sampleLength }
					if (j>=jump2) { samplePitch*=1-data.frequencyJump2amount; jump2=sampleLength }
					// Pitch
					samplePitch-= data.pitch;
				}
			}
			sample.buffer=buffer;
		}
		return sample;		
	},
	createAudioChannel:function(volume,channel) {
		if (!channel) channel={volume:volume};
		if (this.audioContext) {
			var audioOut;
			audioOut=this.audioContext.createGain();
			audioOut.connect(this.audioContext.destination);
			audioOut.gain.value=volume;
			channel.audioOut=audioOut;
		}
		return channel;
	},
	stopChannel:function(ch) {
		if (this.audioContext&&this.channels[ch]) {
			this.channels[ch].stop();
			delete this.channels[ch];
		}
	},
	stopAudio:function(ch) {
		if (this.audioContext) {
			if (!ch) ch=this.channels;
			for (var channel in ch) this.stopChannel(channel);
		}
	},
	playAudio:function(hwchannel,audio,channel) {
		if (this.audioContext&&audio&&channel) {
			// Generate previous requested samples om-the-fly
			if (!audio.buffer)
				if (audio.noise) {						
					this.generateNoise(audio.parms,audio.frequency,audio);						
				}
			if (audio.buffer) {
				if (!hwchannel.audioOut)
					this.createAudioChannel(hwchannel.volume,hwchannel);
				var source = this.audioContext.createBufferSource();
				this.stopChannel(channel);
			  	source.buffer = audio.buffer;
			  	source.connect(hwchannel.audioOut);
				source.start(0);
				this.channels[channel]=source;
			}
		}		
	}
}