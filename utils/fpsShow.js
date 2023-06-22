export class FPSShower {
  constructor(func, circle) {
    this.func = func
    this.circle = circle || 1000
    this.enable = false
    this.lastUtc = 0
    this.counter = 0
  }
  time() {
    if(this.enable) {
      this.counter++
      if(FPSShower.hmTime.utc - this.lastUtc > this.circle) {
        this.lastUtc = FPSShower.hmTime.utc
        this.func(Math.ceil(this.counter / (this.circle / 1000.0)))
        this.counter = 0
      }
    }
    else {
      this.enable = true
      this.lastUtc = FPSShower.hmTime.utc
    }
  }
}
FPSShower.hmTime = hmSensor.createSensor(hmSensor.id.TIME)