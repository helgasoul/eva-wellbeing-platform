import { useEffect } from 'react'
import './final-fix.css'

/**
 * Компонент для автоматического применения исправлений цветов
 * Устанавливает белый фон и черные шрифты для всех элементов
 */
export const ColorFixer = () => {
  useEffect(() => {
    // Принудительно применяем стили через JavaScript как дополнительная мера
    const applyColorFix = () => {
      // Устанавливаем белый фон для body
      document.body.style.backgroundColor = 'white'
      document.body.style.color = 'black'
      
      // Находим и исправляем все элементы
      const allElements = document.querySelectorAll('*')
      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement
        
        // Белый фон и черный текст для всех элементов
        htmlElement.style.backgroundColor = 'white'
        htmlElement.style.color = 'black'
        
        // Специально для кнопок
        if (htmlElement.tagName === 'BUTTON') {
          htmlElement.style.backgroundColor = 'white'
          htmlElement.style.color = 'black'
          htmlElement.style.border = '2px solid black'
          htmlElement.style.padding = '12px 24px'
          htmlElement.style.borderRadius = '8px'
          htmlElement.style.fontWeight = '600'
          htmlElement.style.cursor = 'pointer'
        }
        
        // Убираем все градиенты
        if (htmlElement.style.background && htmlElement.style.background.includes('gradient')) {
          htmlElement.style.background = 'white'
        }
        
        // Убираем классы с градиентами
        if (htmlElement.className && htmlElement.className.includes('gradient')) {
          htmlElement.style.background = 'white !important'
          htmlElement.style.color = 'black !important'
        }
      })
    }
    
    // Применяем исправления сразу
    applyColorFix()
    
    // Применяем исправления при изменении DOM
    const observer = new MutationObserver(applyColorFix)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['class', 'style']
    })
    
    // Применяем исправления каждые 100мс для гарантии
    const interval = setInterval(applyColorFix, 100)
    
    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return null // Этот компонент не рендерит ничего, только применяет стили
}

export default ColorFixer