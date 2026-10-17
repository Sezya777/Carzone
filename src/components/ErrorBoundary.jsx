import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Что-то пошло не так</h2>
          <p>{this.state.error?.message || 'Произошла непредвиденная ошибка.'}</p>
          <button
            type="button"
            className="primary-btn"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
