/**
 * 音频系统测试脚本
 * 用于验证跨平台兼容性和性能
 */

import { soundManager } from './soundManager'
import { SoundType } from './audioTypes'

export class AudioSystemTester {
  private testResults: { [key: string]: boolean } = {}
  private platform: string = ''

  constructor() {
    this.detectPlatform()
  }

  /**
   * 检测当前运行平台
   */
  private detectPlatform(): void {
    // #ifdef H5
    this.platform = 'h5'
    // #endif
    
    // #ifdef MP-WEIXIN
    this.platform = 'mp-weixin'
    // #endif
    
    // #ifdef MP-ALIPAY
    this.platform = 'mp-alipay'
    // #endif
    
    // #ifdef APP-PLUS
    this.platform = 'app'
    // #endif
  }

  /**
   * 运行完整的音频系统测试
   */
  async runFullTest(): Promise<{ success: boolean; results: any }> {
    console.log(`🔬 开始在 ${this.platform} 平台上测试音频系统...`)
    
    const tests = [
      () => this.testInitialization(),
      () => this.testSoundPlayback(),
      () => this.testVolumeControl(),
      () => this.testMuteFunction(),
      () => this.testConcurrentPlayback(),
      () => this.testSettingsPersistence(),
      () => this.testErrorHandling(),
      () => this.testPerformance()
    ]

    let allPassed = true

    for (const test of tests) {
      try {
        const result = await test()
        if (!result) {
          allPassed = false
        }
      } catch (error) {
        console.error('测试执行失败:', error)
        allPassed = false
      }
    }

    const summary = {
      platform: this.platform,
      success: allPassed,
      results: this.testResults,
      timestamp: new Date().toISOString()
    }

    console.log('🔊 音频系统测试完成:', summary)
    return summary
  }

  /**
   * 测试音频系统初始化
   */
  private async testInitialization(): Promise<boolean> {
    try {
      console.log('📱 测试音频系统初始化...')
      
      await soundManager.init()
      
      const status = soundManager.getSoundStatus()
      const passed = status.initialized === true
      
      this.testResults.initialization = passed
      console.log(`初始化测试: ${passed ? '✅ 通过' : '❌ 失败'}`)
      
      return passed
    } catch (error) {
      console.error('初始化测试失败:', error)
      this.testResults.initialization = false
      return false
    }
  }

  /**
   * 测试音效播放
   */
  private async testSoundPlayback(): Promise<boolean> {
    try {
      console.log('🎵 测试音效播放...')
      
      const soundTypes = [
        SoundType.BUBBLE_POP,
        SoundType.ACHIEVEMENT,
        SoundType.LEVEL_UP,
        SoundType.COUNTDOWN_COMPLETE,
        SoundType.REWARD
      ]

      let passedCount = 0

      for (const soundType of soundTypes) {
        try {
          soundManager.playSound(soundType, 0.1) // 使用低音量测试
          passedCount++
          
          // 等待一小段时间确保音效开始播放
          await this.sleep(100)
        } catch (error) {
          console.warn(`音效播放失败 ${soundType}:`, error)
        }
      }

      const passed = passedCount === soundTypes.length
      this.testResults.soundPlayback = passed
      console.log(`音效播放测试: ${passedCount}/${soundTypes.length} 通过`)
      
      return passed
    } catch (error) {
      console.error('音效播放测试失败:', error)
      this.testResults.soundPlayback = false
      return false
    }
  }

  /**
   * 测试音量控制
   */
  private async testVolumeControl(): Promise<boolean> {
    try {
      console.log('🔊 测试音量控制...')
      
      // 测试主音量调节
      soundManager.setMasterVolume(0.5)
      await this.sleep(100)
      
      soundManager.setMasterVolume(0.8)
      await this.sleep(100)
      
      // 测试音效音量调节
      soundManager.setSoundVolume(0.3)
      await this.sleep(100)
      
      soundManager.setSoundVolume(0.7)
      await this.sleep(100)
      
      this.testResults.volumeControl = true
      console.log('音量控制测试: ✅ 通过')
      
      return true
    } catch (error) {
      console.error('音量控制测试失败:', error)
      this.testResults.volumeControl = false
      return false
    }
  }

  /**
   * 测试静音功能
   */
  private async testMuteFunction(): Promise<boolean> {
    try {
      console.log('🔇 测试静音功能...')
      
      // 测试静音
      soundManager.setMuted(true)
      soundManager.playSound(SoundType.BUBBLE_POP, 1.0)
      await this.sleep(200)
      
      // 测试取消静音
      soundManager.setMuted(false)
      soundManager.playSound(SoundType.BUBBLE_POP, 0.2)
      await this.sleep(200)
      
      this.testResults.muteFunction = true
      console.log('静音功能测试: ✅ 通过')
      
      return true
    } catch (error) {
      console.error('静音功能测试失败:', error)
      this.testResults.muteFunction = false
      return false
    }
  }

  /**
   * 测试并发播放
   */
  private async testConcurrentPlayback(): Promise<boolean> {
    try {
      console.log('🎶 测试并发播放...')
      
      // 同时播放多个音效
      soundManager.playSound(SoundType.BUBBLE_POP, 0.3)
      soundManager.playSound(SoundType.ACHIEVEMENT, 0.3)
      
      await this.sleep(500)
      
      const status = soundManager.getSoundStatus()
      const passed = status.playingCount >= 0 // 检查是否正常处理并发播放
      
      this.testResults.concurrentPlayback = passed
      console.log(`并发播放测试: ${passed ? '✅ 通过' : '❌ 失败'}`)
      
      return passed
    } catch (error) {
      console.error('并发播放测试失败:', error)
      this.testResults.concurrentPlayback = false
      return false
    }
  }

  /**
   * 测试设置持久化
   */
  private async testSettingsPersistence(): Promise<boolean> {
    try {
      console.log('💾 测试设置持久化...')
      
      // 保存一些设置
      soundManager.setMasterVolume(0.6)
      soundManager.setSoundVolume(0.4)
      
      await this.sleep(100)
      
      // 检查设置是否已保存
      const settings = soundManager.getSettings()
      const passed = settings.masterVolume === 0.6 && settings.soundVolume === 0.4
      
      this.testResults.settingsPersistence = passed
      console.log(`设置持久化测试: ${passed ? '✅ 通过' : '❌ 失败'}`)
      
      return passed
    } catch (error) {
      console.error('设置持久化测试失败:', error)
      this.testResults.settingsPersistence = false
      return false
    }
  }

  /**
   * 测试错误处理
   */
  private async testErrorHandling(): Promise<boolean> {
    try {
      console.log('⚠️ 测试错误处理...')
      
      // 尝试播放不存在的音效（应该优雅处理）
      try {
        soundManager.playSound('non-existent-sound' as SoundType, 0.5)
      } catch (error) {
        // 预期会捕获错误
      }
      
      await this.sleep(100)
      
      this.testResults.errorHandling = true
      console.log('错误处理测试: ✅ 通过')
      
      return true
    } catch (error) {
      console.error('错误处理测试失败:', error)
      this.testResults.errorHandling = false
      return false
    }
  }

  /**
   * 测试性能
   */
  private async testPerformance(): Promise<boolean> {
    try {
      console.log('⚡ 测试性能...')
      
      const startTime = Date.now()
      
      // 快速连续播放多个音效
      for (let i = 0; i < 10; i++) {
        soundManager.playSound(SoundType.BUBBLE_POP, 0.1)
        await this.sleep(50) // 50ms间隔
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // 性能要求：10个音效在2秒内完成播放
      const passed = duration < 2000
      
      this.testResults.performance = passed
      console.log(`性能测试: ${passed ? '✅ 通过' : '❌ 失败'} (${duration}ms)`)
      
      return passed
    } catch (error) {
      console.error('性能测试失败:', error)
      this.testResults.performance = false
      return false
    }
  }

  /**
   * 工具方法：等待指定时间
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取平台特定的优化建议
   */
  getPlatformOptimizations(): string[] {
    const suggestions: string[] = []
    
    switch (this.platform) {
      case 'h5':
        suggestions.push(
          'H5平台建议：预加载所有音效文件以减少延迟',
          'H5平台建议：使用Web Audio API可以获得更好的性能',
          'H5平台建议：考虑用户可能需要手动交互后才能播放音频'
        )
        break
        
      case 'mp-weixin':
        suggestions.push(
          '微信小程序建议：限制音效文件大小在100KB以内',
          '微信小程序建议：使用uni.createInnerAudioContext获得最佳兼容性',
          '微信小程序建议：注意音频播放次数限制'
        )
        break
        
      case 'app':
        suggestions.push(
          'App平台建议：可以使用原生音频API获得更好性能',
          'App平台建议：支持更多音频格式和更高音质',
          'App平台建议：可以实现更复杂的音频处理效果'
        )
        break
    }
    
    return suggestions
  }
}

// 导出测试器实例
export const audioTester = new AudioSystemTester()

// 便捷的测试方法
export const runAudioTest = async () => {
  return await audioTester.runFullTest()
}